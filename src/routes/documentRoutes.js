import express from "express";
import multer from "multer";
import {
  deleteDocument,
  listDocuments,
  saveSignature,
  uploadDocument
} from "../controllers/documentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.use(requireAuth);
router.get("/", listDocuments);
router.post("/", upload.single("file"), uploadDocument);
router.patch("/:documentId/signature", saveSignature);
router.delete("/:documentId", deleteDocument);

export default router;
