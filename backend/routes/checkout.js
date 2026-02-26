import express from "express";
import Stripe from "stripe";
import { pool } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const pendingStripeSessions = new Map();
const finalizedSessions = new Set();

const ensureStripeConfigured = (res) => {
  if (!stripe || stripeSecretKey.toLowerCase().includes("replace_with_")) {
    res.status(500).json({ message: "Stripe is not configured. Set a real STRIPE_SECRET_KEY." });
    return false;
  }
  return true;
};

const toMinorAmount = (amount) => Math.round(Number(amount) * 100);

const applyTemplatePurchases = async ({ userId, cartItems }) => {
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

router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    if (!ensureStripeConfigured(res)) return;

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

    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });
    if (finalizedSessions.has(sessionId)) {
      return res.json({ message: "Session already confirmed", alreadyConfirmed: true });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const pending = pendingStripeSessions.get(sessionId);
    if (!pending || pending.userId !== userId) {
      return res.status(404).json({ message: "Checkout session not found for this user" });
    }

    await applyTemplatePurchases({ userId, cartItems: pending.cartItems });

    finalizedSessions.add(sessionId);
    pendingStripeSessions.delete(sessionId);

    return res.json({ message: "Payment confirmed and purchase applied" });
  } catch (err) {
    console.error("Stripe confirm-session error:", err);
    return res.status(500).json({ message: "Failed to confirm Stripe session" });
  }
});

export default router;
