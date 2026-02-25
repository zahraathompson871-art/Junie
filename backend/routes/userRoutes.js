import express from "express";
import{getUsers, getUser, createUser, deleteUserByEmail, loginUser, getCurrentUser, updateUser} from "../controllers/userCon.js"
import { getUserDashboard, saveUserDashboard } from "../models/userModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateUser);

router.get("/dashboard", protect, async (req, res) => {
  try {
    const dashboard = await getUserDashboard(req.user.id);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve dashboard" });
  }
});

router.put("/dashboard", protect, async (req, res) => {
  try {
    await saveUserDashboard(req.user.id, req.body.dashboard);
    res.json({ message: "Dashboard saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save dashboard" });
  }
});

router.get("/:id", getUser);
router.post("/", createUser);
router.delete("/", deleteUserByEmail);
router.post("/login", loginUser);

export default router;
