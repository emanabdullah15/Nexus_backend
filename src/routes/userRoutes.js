import express from "express";
import { getUserById, listUsers } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", listUsers);
router.get("/:userId", getUserById);

export default router;
