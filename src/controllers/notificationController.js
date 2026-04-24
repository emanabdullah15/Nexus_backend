import { Notification } from "../models/Notification.js";
import { mapNotificationResponse } from "../services/notificationService.js";

export const listNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ notifications: notifications.map(mapNotificationResponse) });
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, recipientId: req.user.id },
    { readAt: new Date() },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  return res.json({ notification: mapNotificationResponse(notification) });
};

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user.id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  return res.json({ message: "All notifications marked as read" });
};
