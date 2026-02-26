import {Router} from "express";
import {protect} from "../middleware/authMiddleware.js";
import * as WorkspaceController from "../controllers/workspaceCon.js";

const router = Router();

router.post("/", protect, WorkspaceController.createWorkspace);
router.get("/", protect, WorkspaceController.getWorkspaces);
router.get("/:id", protect, WorkspaceController.getWorkspace);
router.put("/:id", protect, WorkspaceController.updateWorkspace);
router.delete("/:id", protect, WorkspaceController.deleteWorkspace);

export default router;