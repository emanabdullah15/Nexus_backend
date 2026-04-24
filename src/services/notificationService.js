import { Notification } from "../models/Notification.js";
import { emitToUser } from "../socket.js";

const mapNotification = (item) => ({
  id: item._id.toString(),
  recipientId: item.recipientId.toString(),
  type: item.type,
  title: item.title,
  content: item.content,
  metadata: item.metadata ?? {},
  readAt: item.readAt,
  createdAt: item.createdAt
});

export const createAndSendNotification = async ({
  recipientId,
  type,
  title,
  content,
  metadata = {}
}) => {
  const notification = await Notification.create({
    recipientId,
    type,
    title,
    content,
    metadata
  });
  const mapped = mapNotification(notification);
  emitToUser(recipientId, "notification:new", mapped);
  return mapped;
};

export const mapNotificationResponse = mapNotification;
