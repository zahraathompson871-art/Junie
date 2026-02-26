import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as PageController from "../controllers/pageCon.js";

const router = Router();

router.post("/", protect, PageController.createPage);
router.get("/book/:bookId", protect, PageController.getPages);
router.get("/:id", protect, PageController.getPage);
router.put("/:id", protect, PageController.updatePage);
router.delete("/:id", protect, PageController.deletePage);

export default router;