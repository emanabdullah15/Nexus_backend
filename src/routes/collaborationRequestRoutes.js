import express from "express";
import {
  createCollaborationRequest,
  listReceivedRequests,
  listSentRequests,
  updateCollaborationRequestStatus
} from "../controllers/collaborationRequestController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/sent", requireRole("investor"), listSentRequests);
router.get("/received", requireRole("entrepreneur"), listReceivedRequests);
router.post("/", requireRole("investor"), createCollaborationRequest);
router.patch("/:requestId/status", requireRole("entrepreneur"), updateCollaborationRequestStatus);

export default router;
