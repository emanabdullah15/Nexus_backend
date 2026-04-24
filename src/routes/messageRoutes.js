import express from "express";
import {
  createMessage,
  listConversations,
  listMessagesWithUser
} from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/conversations", listConversations);
router.get("/with/:userId", listMessagesWithUser);
router.post("/", createMessage);

export default router;
