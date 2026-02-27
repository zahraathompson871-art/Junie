import express from "express";
import { pool } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";
import { purchaseNotebookSlots, unlockNotebookUnlimited } from "../models/bookModel.js";

const router = express.Router();
const pendingSimulatedSessions = new Map();
let commerceSchemaReady = false;

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS simulated_payments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      session_id VARCHAR(80) NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      cart_items_json JSON NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_session_id (session_id)
    )
  `);

  commerceSchemaReady = true;
};

const createSessionId = (userId) =>
  `SIM-${Date.now()}-${userId}-${Math.floor(Math.random() * 100000)}`;

const applyTemplatePurchases = async ({ userId, cartItems }) => {
  await ensureCommerceSchema();

  for (const item of cartItems) {
    const type = String(item?.type || "template");
    if (type !== "template") continue;

    const templateId = Number(item.id);
    if (!templateId) continue;

    const [existingPurchase] = await pool.query(
      "SELECT id FROM purchases WHERE user_id = ? AND template_id = ? LIMIT 1",
      [userId, templateId]
    );
    if (existingPurchase.length > 0) continue;

    try {
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
    } catch (err) {
      console.warn(`Skipping widget application for template ${templateId}:`, err.message);
    }

    await pool.query("INSERT INTO purchases (user_id, template_id) VALUES (?, ?)", [userId, templateId]);
  }
};

const applyNotebookPurchases = async ({ userId, cartItems }) => {
  for (const item of cartItems) {
    const type = String(item?.type || "template");
    if (type === "notebook_slot") {
      const quantity = Number(item?.quantity || 1);
      await purchaseNotebookSlots(userId, Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
    }
    if (type === "notebook_unlimited") {
      await unlockNotebookUnlimited(userId);
    }
  }
};

const applyPremiumPurchases = async ({ userId, cartItems }) => {
  const hasPremium = cartItems.some((item) => String(item?.type || "") === "premium_subscription");
  if (!hasPremium) return;

  await pool.query(
    `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan_code, status, current_period_end)
     VALUES (?, ?, 'templates_monthly', 'active', DATE_ADD(NOW(), INTERVAL 1 MONTH))
     ON DUPLICATE KEY UPDATE
       status = 'active',
       plan_code = 'templates_monthly',
       current_period_end = DATE_ADD(NOW(), INTERVAL 1 MONTH)`,
    [userId, `SIM-SUB-${userId}`]
  );

  await unlockNotebookUnlimited(userId);
};

router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    await ensureCommerceSchema();

    const { cartItems = [] } = req.body;
    const userId = req.user.id;
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    const sessionId = createSessionId(userId);
    pendingSimulatedSessions.set(sessionId, { userId, cartItems, finalized: false });

    await pool.query(
      `INSERT INTO simulated_payments (session_id, user_id, cart_items_json, status)
       VALUES (?, ?, ?, 'PENDING')
       ON DUPLICATE KEY UPDATE
         cart_items_json = VALUES(cart_items_json),
         status = 'PENDING'`,
      [sessionId, userId, JSON.stringify(cartItems)]
    );

    return res.json({
      provider: "simulated",
      sessionId,
      url: `${frontendUrl}/#/thankyou?session_id=${encodeURIComponent(sessionId)}`,
    });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({ message: "Failed to start simulated checkout" });
  }
});

router.post("/confirm-session", protect, async (req, res) => {
  try {
    await ensureCommerceSchema();

    const { sessionId } = req.body;
    const userId = req.user.id;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

    const [rows] = await pool.query(
      "SELECT session_id, user_id, cart_items_json, status FROM simulated_payments WHERE session_id = ? LIMIT 1",
      [sessionId]
    );

    const payment = rows[0];
    if (!payment || Number(payment.user_id) !== Number(userId)) {
      return res.status(404).json({ message: "Checkout session not found for this user" });
    }

    const pending = pendingSimulatedSessions.get(sessionId);
    if (pending && !pending.finalized) {
      await applyTemplatePurchases({ userId, cartItems: pending.cartItems });
      await applyNotebookPurchases({ userId, cartItems: pending.cartItems });
      await applyPremiumPurchases({ userId, cartItems: pending.cartItems });
      pending.finalized = true;
    } else if (!pending) {
      const cartItems = Array.isArray(payment.cart_items_json)
        ? payment.cart_items_json
        : JSON.parse(payment.cart_items_json || "[]");
      await applyTemplatePurchases({ userId, cartItems });
      await applyNotebookPurchases({ userId, cartItems });
      await applyPremiumPurchases({ userId, cartItems });
    }

    if (payment.status !== "COMPLETE") {
      await pool.query(
        "UPDATE simulated_payments SET status = 'COMPLETE' WHERE session_id = ?",
        [sessionId]
      );
    }

    return res.json({ message: "Simulated payment confirmed and purchase applied", mode: "payment" });
  } catch (err) {
    console.error("confirm-session error:", err);
    return res.status(500).json({ message: "Failed to confirm simulated checkout session" });
  }
});

router.post("/create-subscription-session", protect, async (req, res) => {
  return res.status(501).json({ message: "Subscriptions are disabled in simulated payment mode." });
});

router.get("/subscription-status", protect, async (req, res) => {
  return res.json({ hasActiveSubscription: false, status: null, currentPeriodEnd: null });
});

export default router;

