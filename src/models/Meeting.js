import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
