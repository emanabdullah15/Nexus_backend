import { User } from "../models/User.js";
import mongoose from "mongoose";

const mapUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.profile?.bio ?? "",
  createdAt: user.createdAt
});

export const listUsers = async (req, res) => {
  const query = {};
  if (req.query.role) query.role = req.query.role;
  const users = await User.find(query).sort({ createdAt: -1 });
  res.json({ users: users.map(mapUser) });
};

export const getUserById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user: mapUser(user) });
};
