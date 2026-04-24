import express from "express";
import { createTransaction, getTransactions } from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getTransactions);
router.post("/", createTransaction);

export default router;
