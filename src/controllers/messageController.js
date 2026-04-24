import { Message } from "../models/Message.js";
import mongoose from "mongoose";
import { createAndSendNotification } from "../services/notificationService.js";

// Map response
const mapMessage = (msg) => ({
  id: msg._id.toString(),
  senderId: msg.senderId.toString(),
  receiverId: msg.receiverId.toString(),
  content: msg.content,
  timestamp: msg.createdAt,
  isRead: msg.isRead
});


// -----------------------------
// GET MESSAGES WITH USER
// -----------------------------
export const listMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user?.id;

    if (!myId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages: messages.map(mapMessage) });

  } catch (err) {
    console.error("listMessagesWithUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------
// GET CONVERSATIONS
// -----------------------------
export const listConversations = async (req, res) => {
  try {
    const myId = req.user?.id;

    if (!myId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const all = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }]
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();

    all.forEach((message) => {
      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();
      const otherId = senderId === myId ? receiverId : senderId;

      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          id: `conv-${myId}-${otherId}`,
          participants: [myId, otherId],
          lastMessage: mapMessage(message),
          updatedAt: message.createdAt
        });
      }
    });

    res.json({ conversations: Array.from(conversationMap.values()) });

  } catch (err) {
    console.error("listConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------
// CREATE MESSAGE
// -----------------------------
export const createMessage = async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver id" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim()
    });

    await createAndSendNotification({
      recipientId: receiverId,
      type: "message",
      title: "New message",
      content: "You have received a new message.",
      metadata: { senderId, messageId: message._id.toString() }
    });

    res.status(201).json({ message: mapMessage(message) });

  } catch (err) {
    console.error("createMessage error:", err);
    res.status(500).json({ message: "Failed to create message" });
  }
};