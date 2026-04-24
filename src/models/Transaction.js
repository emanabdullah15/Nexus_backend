import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, enum: ["deposit", "withdraw", "transfer"], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    reference: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
