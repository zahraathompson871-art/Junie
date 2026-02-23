import express from "express";
import{getUsers, getUser, createUser, deleteUserByEmail, loginUser} from "../controllers/userCon.js"
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/:id",getUser);
router.post("/",createUser);
router.delete("/", deleteUserByEmail);
router.post("/login", loginUser);

export default router;