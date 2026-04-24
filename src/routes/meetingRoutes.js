import express from "express";
import {
  createMeeting,
  getMyMeetings,
  updateMeetingStatus
} from "../controllers/meetingController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getMyMeetings);
router.post("/", createMeeting);
router.patch("/:meetingId/status", updateMeetingStatus);

export default router;
