import express from 'express';
import {pool} from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { saveUserDashboard } from '../models/userModel.js';
import jwt from "jsonwebtoken";

const router = express.Router();
let commerceSchemaReady = false;

const builtInTemplates = [
  {
    id: 101,
    title: 'Sage Scholar',
    description: 'Minimal academic workspace with study and planning blocks.',
    price: 79,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop',
    themeKey: 'matcha',
    theme: {
      name: 'Matcha Green',
      colors: ['#f7faf4', '#9caf88', '#4f6f52']
    },
    widgets: [
      { type: 'assignment_tracker', data: [], size: 6, rows: 2 },
      { type: 'study_session_log', data: [], size: 6, rows: 2 },
      { type: 'todo', data: [], size: 4, rows: 1 },
      { type: 'goal', data: { current: 0, total: 10, target: 'Weekly study target' }, size: 4, rows: 1 },
      { type: 'calendar', data: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() }, size: 4, rows: 1 }
    ]
  },
  {
    id: 102,
    title: 'Cafe Focus',
    description: 'Cozy productivity layout with notes, mood, and session tracking.',
    price: 69,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80&auto=format&fit=crop',
    themeKey: 'coffee',
    theme: {
      name: 'Coffee Brown',
      colors: ['#f5efe6', '#e8dccf', '#7a5c4d']
    },
    widgets: [
      { type: 'quick_notes', data: [], size: 6, rows: 2 },
      { type: 'mood_tracker', data: [], size: 4, rows: 1 },
      { type: 'study_session_log', data: [], size: 4, rows: 2 },
      { type: 'pomodoro', data: {}, size: 4, rows: 1 },
      { type: 'picture', data: { src: '' }, size: 6, rows: 2 }
    ]
  },
  {
    id: 103,
    title: 'Midnight Focus',
    description: 'Dark academic layout for deep focus and night studying.',
    price: 89,
    image: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&q=80&auto=format&fit=crop',
    themeKey: 'dark_academia',
    theme: {
      name: 'Dark Academia',
      colors: ['#1e1e22', '#4c5c8a', '#a29bfe']
    },
    widgets: [
      { type: 'goal', data: { current: 0, total: 100, target: 'Semester KPI' }, size: 6, rows: 1 },
      { type: 'todo', data: [], size: 6, rows: 2 },
      { type: 'assignment_tracker', data: [], size: 6, rows: 2 },
      { type: 'calendar', data: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() }, size: 6, rows: 1 }
    ]
  },
  {
    id: 104,
    title: 'Ocean Reset',
    description: 'Calm, airy workspace with ocean blue tones.',
    price: 79,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop',
    themeKey: 'ocean',
    theme: {
      name: 'Ocean Theme',
      colors: ['#f2f8fb', '#a7c7e7', '#6ba8a9']
    },
    widgets: [
      { type: 'calendar', data: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() }, size: 6, rows: 1 },
      { type: 'quick_notes', data: [], size: 6, rows: 2 },
      { type: 'todo', data: [], size: 4, rows: 1 },
      { type: 'mood_tracker', data: [], size: 4, rows: 1 },
      { type: 'picture', data: { src: '' }, size: 4, rows: 2 }
    ]
  },
  {
    id: 105,
    title: 'Blush Planner',
    description: 'Soft flower-inspired planner aesthetic.',
    price: 75,
    image: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=1200&q=80&auto=format&fit=crop',
    themeKey: 'flower',
    theme: {
      name: 'Flower Theme',
      colors: ['#fff6f9', '#f4c2c2', '#c38eb4']
    },
    widgets: [
      { type: 'goal', data: { current: 0, total: 100, target: 'Semester KPI' }, size: 6, rows: 1 },
      { type: 'todo', data: [], size: 6, rows: 2 },
      { type: 'assignment_tracker', data: [], size: 6, rows: 2 },
      { type: 'calendar', data: { currentMonth: new Date().getMonth(), currentYear: new Date().getFullYear() }, size: 6, rows: 1 }
    ]
  }
];

const normalizeWidgets = (widgets = []) => {
  return widgets.map((w, i) => ({
    id: Date.now() + i,
    type: w.type,
    data: w.data ?? {},
    size: w.size ?? 4,
    rows: w.rows ?? 1
  }));
};

const safeParseWidgetData = (value) => {
  if (typeof value !== "string") return value || {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
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

const resolveOptionalUserId = (req) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) return null;
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id || null;
  } catch {
    return null;
  }
};

const getEntitlements = async (userId) => {
  await ensureCommerceSchema();
  if (!userId) {
    return { hasActiveSubscription: false, purchasedTemplateIds: [] };
  }

  const [purchases] = await pool.query(
    "SELECT template_id FROM purchases WHERE user_id = ?",
    [userId]
  );
  const [subs] = await pool.query(
    `SELECT status
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId]
  );

  const hasActiveSubscription = !!subs[0] && ["active", "trialing"].includes(subs[0].status);
  const purchasedTemplateIds = purchases.map((p) => Number(p.template_id));

  return { hasActiveSubscription, purchasedTemplateIds };
};

router.get("/", async (req, res) => {
  try {
    const userId = resolveOptionalUserId(req);
    const { hasActiveSubscription, purchasedTemplateIds } = await getEntitlements(userId);
    const purchasedSet = new Set(purchasedTemplateIds);

    const builtInMeta = builtInTemplates.map(({ widgets, ...meta }) => ({
      ...meta,
      widgetCount: widgets.length,
      previewWidgets: widgets.map(w => w.type),
      isPurchased: purchasedSet.has(Number(meta.id)),
      isUnlocked: hasActiveSubscription || purchasedSet.has(Number(meta.id)),
      unlockType: hasActiveSubscription ? "subscription" : (purchasedSet.has(Number(meta.id)) ? "purchase" : null),
    }));

    let dbMeta = [];
    try {
      const [dbTemplates] = await pool.query(
        "SELECT DISTINCT template_id AS id FROM template_widgets ORDER BY template_id"
      );

      dbMeta = await Promise.all(
        dbTemplates.map(async ({ id }) => {
          const [widgets] = await pool.query(
            "SELECT widget_type, widget_data, position FROM template_widgets WHERE template_id = ? ORDER BY position",
            [id]
          );
          return {
            id: Number(id),
            title: `Template #${id}`,
            description: "Dashboard template from your template library.",
            price: 59,
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&q=80&auto=format&fit=crop",
            themeKey: "ocean",
            theme: {
              name: "Ocean Theme",
              colors: ["#f2f8fb", "#a7c7e7", "#6ba8a9"]
            },
            widgetCount: widgets.length,
            previewWidgets: widgets.map(w => w.widget_type),
            isPurchased: purchasedSet.has(Number(id)),
            isUnlocked: hasActiveSubscription || purchasedSet.has(Number(id)),
            unlockType: hasActiveSubscription ? "subscription" : (purchasedSet.has(Number(id)) ? "purchase" : null),
          };
        })
      );
    } catch (dbErr) {
      console.warn("Failed to load DB templates, returning built-in templates only", dbErr.message);
    }

    const templates = [...builtInMeta, ...dbMeta];
    return res.json(templates);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load templates" });
  }
});

router.post("/:id/apply", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const templateId = Number(req.params.id);
    const { hasActiveSubscription, purchasedTemplateIds } = await getEntitlements(userId);

    if (!hasActiveSubscription && !purchasedTemplateIds.includes(templateId)) {
      return res.status(403).json({ message: "Please purchase this template or subscribe before applying it." });
    }

    const builtIn = builtInTemplates.find(t => t.id === templateId);
    if (builtIn) {
      await saveUserDashboard(userId, normalizeWidgets(builtIn.widgets));
      return res.json({
        message: "Template applied to dashboard",
        source: "built-in",
        themeKey: builtIn.themeKey,
        theme: builtIn.theme
      });
    }

    const [widgets] = await pool.query(
      "SELECT widget_type, widget_data, position FROM template_widgets WHERE template_id = ? ORDER BY position",
      [templateId]
    );

    if (!widgets.length) {
      return res.status(404).json({ message: "Template not found" });
    }

    const mapped = widgets.map((w, i) => ({
      id: Date.now() + i,
      type: w.widget_type,
      data: safeParseWidgetData(w.widget_data),
      size: 4,
      rows: 1
    }));

    await saveUserDashboard(userId, mapped);
    return res.json({
      message: "Template applied to dashboard",
      source: "database",
      themeKey: "ocean",
      theme: {
        name: "Ocean Theme",
        colors: ["#f2f8fb", "#a7c7e7", "#6ba8a9"]
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to apply template" });
  }
});

router.get("/entitlements", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const entitlements = await getEntitlements(userId);
    return res.json(entitlements);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load entitlements" });
  }
});

router.post("/:id/purchase", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const templateId = req.params.id;

    const [existing] = await pool.query(
      "SELECT * FROM dashboard_widgets WHERE user_id = ? AND widget_type IN (SELECT widget_type FROM template_widgets WHERE template_id = ?)",
      [userId, templateId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Template already applied" });
    }

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

    res.json({ message: "Template applied successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to apply template" });
  }

});

export default router;
