import express from "express";
import{getUsers, getUser, createUser, deleteUserByEmail} from "../controllers/userCon.js"

const router = express.Router();

router.get("/", getUsers);
router.get("/:id",getUser);
router.post("/",createUser);
router.delete("/", deleteUserByEmail);

export default router;