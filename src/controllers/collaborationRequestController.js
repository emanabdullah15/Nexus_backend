import mongoose from "mongoose";
import { CollaborationRequest } from "../models/CollaborationRequest.js";
import { User } from "../models/User.js";
import { createAndSendNotification } from "../services/notificationService.js";

const mapRequest = (request) => ({
  id: request._id.toString(),
  investorId: request.investorId.toString(),
  entrepreneurId: request.entrepreneurId.toString(),
  message: request.message,
  status: request.status,
  createdAt: request.createdAt
});

export const createCollaborationRequest = async (req, res) => {
  const investorId = req.user.id;
  const { entrepreneurId, message } = req.body;

  if (!mongoose.isValidObjectId(entrepreneurId)) {
    return res.status(400).json({ message: "Invalid entrepreneur id" });
  }
  if (!message?.trim()) {
    return res.status(400).json({ message: "Request message is required" });
  }

  const entrepreneur = await User.findById(entrepreneurId);
  if (!entrepreneur || entrepreneur.role !== "entrepreneur") {
    return res.status(404).json({ message: "Entrepreneur not found" });
  }

  const existingPending = await CollaborationRequest.findOne({
    investorId,
    entrepreneurId,
    status: "pending"
  });
  if (existingPending) {
    return res.status(409).json({ message: "Pending request already exists" });
  }

  const request = await CollaborationRequest.create({
    investorId,
    entrepreneurId,
    message: message.trim()
  });

  await createAndSendNotification({
    recipientId: entrepreneurId,
    type: "collaboration",
    title: "New collaboration request",
    content: "An investor sent a collaboration request.",
    metadata: { requestId: request._id.toString(), investorId }
  });

  return res.status(201).json({ request: mapRequest(request) });
};

export const listSentRequests = async (req, res) => {
  const requests = await CollaborationRequest.find({ investorId: req.user.id }).sort({
    createdAt: -1
  });
  return res.json({ requests: requests.map(mapRequest) });
};

export const listReceivedRequests = async (req, res) => {
  const requests = await CollaborationRequest.find({ entrepreneurId: req.user.id }).sort({
    createdAt: -1
  });
  return res.json({ requests: requests.map(mapRequest) });
};

export const updateCollaborationRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid request status" });
  }

  const request = await CollaborationRequest.findOneAndUpdate(
    { _id: requestId, entrepreneurId: req.user.id },
    { status },
    { new: true }
  );

  if (!request) return res.status(404).json({ message: "Request not found" });
  await createAndSendNotification({
    recipientId: request.investorId,
    type: "collaboration",
    title: "Collaboration request updated",
    content: `Your collaboration request was ${status}.`,
    metadata: { requestId: request._id.toString(), status }
  });
  return res.json({ request: mapRequest(request) });
};
