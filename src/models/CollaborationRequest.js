import mongoose from "mongoose";

const collaborationRequestSchema = new mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

collaborationRequestSchema.index(
  { investorId: 1, entrepreneurId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export const CollaborationRequest = mongoose.model(
  "CollaborationRequest",
  collaborationRequestSchema
);
