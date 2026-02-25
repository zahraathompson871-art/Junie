import express from 'express';
import {pool} from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

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
