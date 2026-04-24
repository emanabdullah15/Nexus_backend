import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["message", "meeting", "payment", "collaboration", "document", "system"],
      default: "system"
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    metadata: { type: Object, default: {} },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
