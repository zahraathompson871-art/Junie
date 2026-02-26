import crypto from "crypto";
import express from "express";
import { pool } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const pendingPayments = new Map();
let commerceSchemaReady = false;

const payfastMerchantId = (process.env.PAYFAST_MERCHANT_ID || "").trim();
const payfastMerchantKey = (process.env.PAYFAST_MERCHANT_KEY || "").trim();
const payfastPassphrase = (process.env.PAYFAST_PASSPHRASE || "").trim();
const payfastSandbox = String(process.env.PAYFAST_SANDBOX || "true").toLowerCase() === "true";
const payfastTrustReturn = String(process.env.PAYFAST_TRUST_RETURN || "false").toLowerCase() === "true";
const payfastStrictValidate = String(process.env.PAYFAST_STRICT_VALIDATE || "true").toLowerCase() === "true";
const payfastItnIpAllowlist = (process.env.PAYFAST_ITN_IP_ALLOWLIST || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

const payfastBaseUrl = payfastSandbox
  ? "https://sandbox.payfast.co.za"
  : "https://www.payfast.co.za";

const ensurePayfastConfigured = (res) => {
  if (
    !payfastMerchantId ||
    !payfastMerchantKey ||
    payfastMerchantId.toLowerCase().includes("replace_with_") ||
    payfastMerchantKey.toLowerCase().includes("replace_with_")
  ) {
    res.status(500).json({ message: "PayFast is not configured. Set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY." });
    return false;
  }
  return true;
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
    CREATE TABLE IF NOT EXISTS payfast_payments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      payment_id VARCHAR(80) NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      cart_items_json JSON NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      pf_payment_id VARCHAR(80) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_payment_id (payment_id)
    )
  `);

  commerceSchemaReady = true;
};

const toAmount = (value) => Number(Number(value || 0).toFixed(2));

const applyTemplatePurchases = async ({ userId, cartItems }) => {
  for (const item of cartItems) {
    const templateId = Number(item.id);
    if (!templateId) continue;

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

const signatureFromEntries = (entries) => {
  const pairs = entries
    .filter(([k, v]) => k !== "signature" && v !== undefined && v !== null && String(v).length > 0)
    .map(([k, v]) => [k, String(v).trim()]);

  if (payfastPassphrase) {
    pairs.push(["passphrase", payfastPassphrase]);
  }

  const payload = new URLSearchParams(pairs).toString();
  return crypto.createHash("md5").update(payload).digest("hex");
};

const generatePayfastSignature = (params) => signatureFromEntries(Object.entries(params));

const createPaymentId = (userId) => `PF-${Date.now()}-${userId}-${Math.floor(Math.random() * 100000)}`;

const validateWithPayfast = async (rawBody) => {
  const validateUrl = `${payfastBaseUrl}/eng/query/validate`;
  const response = await fetch(validateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: rawBody,
  });
  const text = (await response.text()).trim().toUpperCase();
  return response.ok && text === "VALID";
};

const normalizeClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  const ip = Array.isArray(xff) ? xff[0] : (xff || req.socket.remoteAddress || "");
  return String(ip).split(",")[0].trim().replace("::ffff:", "");
};

router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    if (!ensurePayfastConfigured(res)) return;
    await ensureCommerceSchema();

    const { cartItems = [], customer = {} } = req.body;
    const userId = req.user.id;
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    const total = toAmount(cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0));
    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ message: "Invalid cart total" });
    }

    const paymentId = createPaymentId(userId);
    const itemName = `Template Purchase (${cartItems.length} item${cartItems.length === 1 ? "" : "s"})`;

    const params = {
      merchant_id: payfastMerchantId,
      merchant_key: payfastMerchantKey,
      return_url: `${frontendUrl}/#/thankyou?payment_id=${encodeURIComponent(paymentId)}`,
      cancel_url: `${frontendUrl}/#/checkout?canceled=1`,
      notify_url: `${(process.env.BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "")}/api/checkout/payfast/itn`,
      name_first: customer.name || "Customer",
      email_address: customer.email || "customer@example.com",
      m_payment_id: paymentId,
      amount: total.toFixed(2),
      item_name: itemName,
      custom_str1: String(userId),
    };
    params.signature = generatePayfastSignature(params);

    pendingPayments.set(paymentId, { userId, cartItems, applied: false });

    await pool.query(
      `INSERT INTO payfast_payments (payment_id, user_id, cart_items_json, amount, status)
       VALUES (?, ?, ?, ?, 'PENDING')
       ON DUPLICATE KEY UPDATE
         cart_items_json = VALUES(cart_items_json),
         amount = VALUES(amount),
         status = 'PENDING'`,
      [paymentId, userId, JSON.stringify(cartItems), total]
    );

    return res.json({
      paymentProvider: "payfast",
      paymentUrl: `${payfastBaseUrl}/eng/process`,
      method: "POST",
      fields: params,
      paymentId,
    });
  } catch (err) {
    console.error("PayFast create-checkout-session error:", err);
    return res.status(500).json({ message: "Failed to create PayFast checkout session" });
  }
});

router.post("/confirm-payfast", protect, async (req, res) => {
  try {
    await ensureCommerceSchema();

    const { paymentId } = req.body;
    const userId = req.user.id;
    if (!paymentId) return res.status(400).json({ message: "paymentId is required" });

    const [rows] = await pool.query(
      "SELECT payment_id, user_id, cart_items_json, status FROM payfast_payments WHERE payment_id = ? LIMIT 1",
      [paymentId]
    );
    const payment = rows[0];
    if (!payment || Number(payment.user_id) !== Number(userId)) {
      return res.status(404).json({ message: "Payment not found for this user" });
    }

    if (payment.status !== "COMPLETE" && !payfastTrustReturn) {
      return res.status(400).json({ message: "Payment not completed yet. Please wait a moment and try again." });
    }

    if (payment.status !== "COMPLETE" && payfastTrustReturn) {
      await pool.query(
        "UPDATE payfast_payments SET status = 'COMPLETE' WHERE payment_id = ?",
        [paymentId]
      );
    }

    const pending = pendingPayments.get(paymentId);
    if (pending && !pending.applied) {
      await applyTemplatePurchases({ userId, cartItems: pending.cartItems });
      pending.applied = true;
    } else if (!pending) {
      const cartItems = Array.isArray(payment.cart_items_json)
        ? payment.cart_items_json
        : JSON.parse(payment.cart_items_json || "[]");
      await applyTemplatePurchases({ userId, cartItems });
    }

    return res.json({ message: "Payment confirmed and purchase applied", mode: "payment" });
  } catch (err) {
    console.error("PayFast confirm-payfast error:", err);
    return res.status(500).json({ message: "Failed to confirm PayFast payment" });
  }
});

router.post("/payfast/itn", express.text({ type: "application/x-www-form-urlencoded" }), async (req, res) => {
  try {
    await ensureCommerceSchema();

    const rawBody = typeof req.body === "string" ? req.body : "";
    const parsed = new URLSearchParams(rawBody);
    const payload = {};
    const signatureEntries = [];
    let signature = "";
    for (const [key, value] of parsed.entries()) {
      if (key === "signature") {
        signature = value;
        continue;
      }
      payload[key] = value;
      signatureEntries.push([key, value]);
    }

    if (!signature) {
      return res.status(400).send("Missing signature");
    }
    const expected = signatureFromEntries(signatureEntries);
    if (expected.toLowerCase() !== String(signature).toLowerCase()) {
      return res.status(400).send("Invalid signature");
    }

    const sourceIp = normalizeClientIp(req);
    if (payfastItnIpAllowlist.length > 0 && !payfastItnIpAllowlist.includes(sourceIp)) {
      return res.status(403).send("Bad source IP address");
    }

    let validData = false;
    try {
      validData = await validateWithPayfast(rawBody);
    } catch (err) {
      if (payfastStrictValidate) {
        return res.status(400).send("Failed to validate ITN");
      }
    }
    if (!validData && payfastStrictValidate) {
      return res.status(400).send("Invalid ITN data");
    }

    const paymentId = payload.m_payment_id;
    const status = String(payload.payment_status || "").toUpperCase();
    const pfPaymentId = payload.pf_payment_id || null;
    const amountGross = toAmount(payload.amount_gross);
    const merchantId = String(payload.merchant_id || "");

    if (!paymentId) return res.status(400).send("Missing m_payment_id");
    if (merchantId !== payfastMerchantId) return res.status(400).send("Merchant mismatch");

    const [existingRows] = await pool.query(
      "SELECT amount FROM payfast_payments WHERE payment_id = ? LIMIT 1",
      [paymentId]
    );
    const existing = existingRows[0];
    if (!existing) return res.status(404).send("Payment not found");
    const dbAmount = toAmount(existing.amount);
    if (Math.abs(dbAmount - amountGross) > 0.01) {
      return res.status(400).send("Amount mismatch");
    }

    const normalizedStatus = status === "COMPLETE" ? "COMPLETE" : (status || "FAILED");

    await pool.query(
      `UPDATE payfast_payments
       SET status = ?, pf_payment_id = ?
       WHERE payment_id = ?`,
      [normalizedStatus, pfPaymentId, paymentId]
    );

    if (normalizedStatus === "COMPLETE") {
      const pending = pendingPayments.get(paymentId);
      if (pending && !pending.applied) {
        await applyTemplatePurchases({ userId: pending.userId, cartItems: pending.cartItems });
        pending.applied = true;
      }
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("PayFast ITN error:", err);
    return res.status(500).send("ERROR");
  }
});

export default router;
