import express from "express";
import { pool } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";
import { getPaypalClient, paypal } from "../config/configPaypal.js";

const router = express.Router();

router.post("/create-order", protect, async (req, res) => {
  try {
    const { cartItems = [], totalAmount } = req.body;
    const currencyCode = (process.env.PAYPAL_CURRENCY || "USD").toUpperCase();

    const computedTotal = Array.isArray(cartItems)
      ? cartItems.reduce((sum, item) => sum + Number(item?.price || 0), 0)
      : 0;

    const amountValue = Number(totalAmount ?? computedTotal);

    if (!amountValue || amountValue <= 0) {
      return res.status(400).json({ message: "Cart total must be greater than zero" });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: amountValue.toFixed(2),
          },
        },
      ],
    });

    const order = await getPaypalClient().execute(request);
    return res.json({ id: order.result.id });
  } catch (err) {
    console.error("PayPal create-order error:", err);
    return res.status(500).json({
      message: "Failed to create PayPal order",
      error: process.env.NODE_ENV === "production" ? undefined : String(err?.message || err),
    });
  }
});

router.post("/capture-order", protect, async (req, res) => {
  try {
    const { orderID, cartItems = [] } = req.body;
    const userId = req.user.id;

    if (!orderID) {
      return res.status(400).json({ message: "orderID is required" });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await getPaypalClient().execute(request);

    if (capture.result.status !== "COMPLETED") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    for (const item of cartItems) {
      const templateId = item.id;

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

      await pool.query(
        "INSERT INTO purchases (user_id, template_id) VALUES (?, ?)",
        [userId, templateId]
      );
    }

    return res.json({ message: "Purchase successful and template applied" });
  } catch (err) {
    console.error("PayPal capture-order error:", err);
    return res.status(500).json({
      message: "Failed to capture PayPal order",
      error: process.env.NODE_ENV === "production" ? undefined : String(err?.message || err),
    });
  }
});

export default router;
