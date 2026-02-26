import {Router} from "express"
import {protect} from "../middleware/authMiddleware.js";
import * as BookController from "../controllers/bookCon.js";

const router = Router();

router.post("/", protect, BookController.createBook);
router.get("/workspace/:workspaceId", protect, BookController.getBooks);
router.get("/:id", protect, BookController.getBook);
router.put("/:id", protect, BookController.updateBook);
router.delete("/:id", protect, BookController.deleteBook);

export default router;
