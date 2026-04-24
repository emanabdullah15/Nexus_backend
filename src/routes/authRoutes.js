import express from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["entrepreneur", "investor"])
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6 }),
    body("role").isIn(["entrepreneur", "investor"])
  ],
  login
);

router.get("/me", requireAuth, me);
router.post("/forgot-password", [body("email").isEmail().normalizeEmail()], forgotPassword);
router.post("/reset-password", [body("newPassword").isLength({ min: 6 })], resetPassword);

export default router;
