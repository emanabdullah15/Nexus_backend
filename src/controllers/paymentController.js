import { Transaction } from "../models/Transaction.js";
import { emitToUser } from "../socket.js";
import { createAndSendNotification } from "../services/notificationService.js";

export const createTransaction = async (req, res) => {
  const { type, amount, recipientUserId } = req.body;
  if (!["deposit", "withdraw", "transfer"].includes(type)) {
    return res.status(400).json({ message: "Invalid transaction type" });
  }
  const normalizedAmount = Number(amount);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const transaction = await Transaction.create({
    userId: req.user.id,
    type,
    amount: normalizedAmount,
    status: "Pending",
    recipientUserId: type === "transfer" ? recipientUserId : null,
    reference: `MOCK-${Date.now()}`
  });
  const mappedTransaction = {
    ...transaction.toObject(),
    id: transaction._id.toString()
  };
  emitToUser(req.user.id, "payment:updated", mappedTransaction);
  await createAndSendNotification({
    recipientId: req.user.id,
    type: "payment",
    title: "Transaction created",
    content: `${type} transaction has been initiated.`,
    metadata: { transactionId: transaction._id.toString(), status: "Pending" }
  });

  setTimeout(async () => {
    const updated = await Transaction.findByIdAndUpdate(
      transaction._id,
      { status: "Completed" },
      { new: true }
    );
    if (!updated) return;
    const mappedUpdated = {
      ...updated.toObject(),
      id: updated._id.toString()
    };
    emitToUser(req.user.id, "payment:updated", mappedUpdated);
    await createAndSendNotification({
      recipientId: req.user.id,
      type: "payment",
      title: "Transaction completed",
      content: `${type} transaction has been completed.`,
      metadata: { transactionId: updated._id.toString(), status: "Completed" }
    });
  }, 1500);

  res.status(201).json({ transaction });
};

export const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ transactions });
};
