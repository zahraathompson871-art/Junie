import express from "express";
import{getUsers, getUser, createUser, deleteUserByEmail, loginUser, getCurrentUser} from "../controllers/userCon.js"
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/me", protect, getCurrentUser);
router.get("/:id",getUser);
router.post("/",createUser);
router.delete("/", deleteUserByEmail);
router.post("/login", loginUser);


export default router;