import {Router} from 'express';
import {protect} from "../middleware/authMiddleware.js";
import * as BlockController from "../controllers/blockCon.js";

const router = Router();

router.post("/", protect, BlockController.createBlock);
router.get("/page/:pageId", protect, BlockController.getBlocks);
router.get("/:id", protect, BlockController.getBlock);
router.put("/:id", protect, BlockController.updateBlock);
router.delete("/:id", protect, BlockController.deleteBlock);

export default router;