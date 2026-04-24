import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    bio: { type: String, default: "" },
    startupHistory: { type: [String], default: [] },
    investmentHistory: { type: [String], default: [] },
    preferences: { type: [String], default: [] }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["entrepreneur", "investor"], required: true },
    avatarUrl: { type: String, default: "" },
    profile: { type: profileSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
