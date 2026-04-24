import { User } from "../models/User.js";

const mapUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.profile?.bio ?? "",
  createdAt: user.createdAt
});

export const updateProfile = async (req, res) => {
  const updates = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (typeof updates.name === "string") user.name = updates.name.trim();
  if (typeof updates.avatarUrl === "string") user.avatarUrl = updates.avatarUrl;
  if (typeof updates.bio === "string") user.profile.bio = updates.bio.trim();
  if (Array.isArray(updates.preferences)) user.profile.preferences = updates.preferences;
  if (Array.isArray(updates.startupHistory)) user.profile.startupHistory = updates.startupHistory;
  if (Array.isArray(updates.investmentHistory)) user.profile.investmentHistory = updates.investmentHistory;

  await user.save();
  res.json({ user: mapUser(user) });
};
