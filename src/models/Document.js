import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    storagePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ["draft", "reviewed", "signed"], default: "draft" },
    signatureImageUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
