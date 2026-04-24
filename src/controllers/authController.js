import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
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

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 12);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    avatarUrl
  });

  const token = createToken(user);
  res.status(201).json({ token, user: mapUser(user) });
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, role } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid || user.role !== role) {
    return res.status(401).json({ message: "Invalid credentials or role mismatch" });
  }

  const token = createToken(user);
  res.json({ token, user: mapUser(user) });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: mapUser(user) });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No account found with this email" });

  const resetToken = jwt.sign({ id: user._id.toString(), type: "reset" }, process.env.JWT_SECRET, {
    expiresIn: "20m"
  });

  res.json({
    message: "Password reset token generated (mock email flow).",
    resetToken
  });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== "reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(payload.id, { password: hashed });
    return res.json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }
};
