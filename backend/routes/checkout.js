import express from "express";
import Stripe from "stripe";
import { pool } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const pendingStripeSessions = new Map();
const finalizedSessions = new Set();
let commerceSchemaReady = false;

const ensureStripeConfigured = (res) => {
  if (!stripe || stripeSecretKey.toLowerCase().includes("replace_with_")) {
    res.status(500).json({ message: "Stripe is not configured. Set a real STRIPE_SECRET_KEY." });
    return false;
  }
  return true;
};

const toMinorAmount = (amount) => Math.round(Number(amount) * 100);
const toMysqlDateTime = (unixTs) => {
  if (!unixTs) return null;
  const date = new Date(unixTs * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
};

const ensureCommerceSchema = async () => {
  if (commerceSchemaReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      template_id BIGINT UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_user_template (user_id, template_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      stripe_customer_id VARCHAR(255) NULL,
      stripe_subscription_id VARCHAR(255) NOT NULL,
      plan_code VARCHAR(64) NOT NULL DEFAULT 'templates_monthly',
      status VARCHAR(40) NOT NULL,
      current_period_end DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_stripe_subscription (stripe_subscription_id),
      KEY idx_user_status (user_id, status)
    )
  `);

  commerceSchemaReady = true;
};

const applyTemplatePurchases = async ({ userId, cartItems }) => {
  await ensureCommerceSchema();

  for (const item of cartItems) {
    const templateId = item.id;

    const [existingPurchase] = await pool.query(
      "SELECT id FROM purchases WHERE user_id = ? AND template_id = ? LIMIT 1",
      [userId, templateId]
    );
    if (existingPurchase.length > 0) continue;

    const [widgets] = await pool.query(
      "SELECT * FROM template_widgets WHERE template_id = ? ORDER BY position",
      [templateId]
    );

    for (const widget of widgets) {
      await pool.query(
        "INSERT INTO dashboard_widgets (user_id, widget_type, widget_data, position) VALUES (?, ?, ?, ?)",
        [userId, widget.widget_type, widget.widget_data, widget.position]
      );
    }

    await pool.query("INSERT INTO purchases (user_id, template_id) VALUES (?, ?)", [userId, templateId]);
  }
};

const saveSubscription = async ({ userId, customerId, subscription }) => {
  await ensureCommerceSchema();
  await pool.query(
    `
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        plan_code,
        status,
        current_period_end
      ) VALUES (?, ?, ?, 'templates_monthly', ?, ?)
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        stripe_customer_id = VALUES(stripe_customer_id),
        status = VALUES(status),
        current_period_end = VALUES(current_period_end)
    `,
    [
      userId,
      customerId || null,
      subscription.id,
      subscription.status || "incomplete",
      toMysqlDateTime(subscription.current_period_end),
    ]
  );
};

router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    if (!ensureStripeConfigured(res)) return;
    await ensureCommerceSchema();

    const { cartItems = [] } = req.body;
    const userId = req.user.id;
    const currency = (process.env.STRIPE_CURRENCY || "zar").trim().toLowerCase();
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.title || `Template ${item.id}`,
        },
        unit_amount: toMinorAmount(item.price),
      },
      quantity: 1,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${frontendUrl}/#/thankyou?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/#/checkout?canceled=1`,
      metadata: {
        userId: String(userId),
      },
    });

    pendingStripeSessions.set(checkoutSession.id, {
      userId,
      cartItems,
    });

    return res.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (err) {
    console.error("Stripe create-checkout-session error:", err);
    return res.status(500).json({ message: "Failed to create Stripe checkout session" });
  }
});

router.post("/confirm-session", protect, async (req, res) => {
  try {
    if (!ensureStripeConfigured(res)) return;
    await ensureCommerceSchema();

    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });
    if (finalizedSessions.has(sessionId)) {
      return res.json({ message: "Session already confirmed", alreadyConfirmed: true });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const pending = pendingStripeSessions.get(sessionId);
    if (!pending || pending.userId !== userId) {
      return res.status(404).json({ message: "Checkout session not found for this user" });
    }

    if (session.mode === "payment") {
      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment not completed" });
      }
      await applyTemplatePurchases({ userId, cartItems: pending.cartItems });
    } else if (session.mode === "subscription") {
      const subscription = session.subscription;
      if (!subscription || typeof subscription !== "object") {
        return res.status(400).json({ message: "Subscription not found on checkout session" });
      }
      if (!["active", "trialing"].includes(subscription.status)) {
        return res.status(400).json({ message: `Subscription not active (${subscription.status})` });
      }
      await saveSubscription({
        userId,
        customerId: typeof session.customer === "string" ? session.customer : null,
        subscription,
      });
    } else {
      return res.status(400).json({ message: `Unsupported checkout mode: ${session.mode}` });
    }

    finalizedSessions.add(sessionId);
    pendingStripeSessions.delete(sessionId);

    return res.json({
      message: session.mode === "subscription"
        ? "Subscription confirmed"
        : "Payment confirmed and purchase applied",
      mode: session.mode,
    });
  } catch (err) {
    console.error("Stripe confirm-session error:", err);
    return res.status(500).json({ message: "Failed to confirm Stripe session" });
  }
});

router.post("/create-subscription-session", protect, async (req, res) => {
  try {
    if (!ensureStripeConfigured(res)) return;
    await ensureCommerceSchema();

    const userId = req.user.id;
    const currency = (process.env.STRIPE_CURRENCY || "zar").trim().toLowerCase();
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
    const amountMajor = Number(process.env.STRIPE_TEMPLATE_SUBSCRIPTION_AMOUNT || 99);

    if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
      return res.status(400).json({ message: "Invalid STRIPE_TEMPLATE_SUBSCRIPTION_AMOUNT" });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "Template Subscription",
              description: "Unlock all dashboard templates while subscribed",
            },
            recurring: {
              interval: "month",
            },
            unit_amount: toMinorAmount(amountMajor),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: String(userId),
      },
      success_url: `${frontendUrl}/#/thankyou?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/#/checkout?canceled=1`,
    });

    pendingStripeSessions.set(checkoutSession.id, {
      userId,
      cartItems: [],
      type: "subscription",
    });

    return res.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (err) {
    console.error("Stripe create-subscription-session error:", err);
    return res.status(500).json({ message: "Failed to create Stripe subscription checkout session" });
  }
});

router.get("/subscription-status", protect, async (req, res) => {
  try {
    await ensureCommerceSchema();
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT status, current_period_end
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId]
    );

    const row = rows[0];
    const hasActiveSubscription = !!row && ["active", "trialing"].includes(row.status);

    return res.json({
      hasActiveSubscription,
      status: row?.status || null,
      currentPeriodEnd: row?.current_period_end || null,
    });
  } catch (err) {
    console.error("Stripe subscription-status error:", err);
    return res.status(500).json({ message: "Failed to get subscription status" });
  }
});

export default router;
