import { Meeting } from "../models/Meeting.js";
import { emitToUser } from "../socket.js";
import { createAndSendNotification } from "../services/notificationService.js";

const overlapQuery = (participantId, startsAt, endsAt) => ({
  $or: [{ investorId: participantId }, { entrepreneurId: participantId }],
  status: { $in: ["pending", "accepted"] },
  startsAt: { $lt: endsAt },
  endsAt: { $gt: startsAt }
});

export const createMeeting = async (req, res) => {
  const { title, investorId, entrepreneurId, startsAt, endsAt } = req.body;
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    return res.status(400).json({ message: "Invalid meeting time range" });
  }

  const conflict = await Meeting.findOne({
    $or: [overlapQuery(investorId, start, end), overlapQuery(entrepreneurId, start, end)]
  });
  if (conflict) {
    return res.status(409).json({ message: "Meeting conflict detected" });
  }

  const meeting = await Meeting.create({
    title,
    investorId,
    entrepreneurId,
    startsAt: start,
    endsAt: end
  });
  const mappedMeeting = {
    ...meeting.toObject(),
    id: meeting._id.toString()
  };
  emitToUser(investorId, "meeting:created", mappedMeeting);
  emitToUser(entrepreneurId, "meeting:created", mappedMeeting);
  const receiverId = req.user.id === investorId ? entrepreneurId : investorId;
  await createAndSendNotification({
    recipientId: receiverId,
    type: "meeting",
    title: "New meeting request",
    content: `${title} has been scheduled and is pending response.`,
    metadata: { meetingId: meeting._id.toString() }
  });
  res.status(201).json({ meeting });
};

export const updateMeetingStatus = async (req, res) => {
  const { meetingId } = req.params;
  const { status } = req.body;
  if (!["accepted", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid meeting status" });
  }
  const meeting = await Meeting.findByIdAndUpdate(meetingId, { status }, { new: true });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  const mappedMeeting = {
    ...meeting.toObject(),
    id: meeting._id.toString()
  };
  emitToUser(meeting.investorId, "meeting:updated", mappedMeeting);
  emitToUser(meeting.entrepreneurId, "meeting:updated", mappedMeeting);
  const recipientId =
    meeting.investorId.toString() === req.user.id
      ? meeting.entrepreneurId.toString()
      : meeting.investorId.toString();
  await createAndSendNotification({
    recipientId,
    type: "meeting",
    title: "Meeting status updated",
    content: `Meeting "${meeting.title}" was ${status}.`,
    metadata: { meetingId: meeting._id.toString(), status }
  });
  res.json({ meeting });
};

export const getMyMeetings = async (req, res) => {
  const meetings = await Meeting.find({
    $or: [{ investorId: req.user.id }, { entrepreneurId: req.user.id }]
  }).sort({ startsAt: 1 });
  res.json({ meetings });
};
