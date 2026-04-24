import express from "express";
import { updateProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.patch("/me", requireAuth, updateProfile);

export default router;
