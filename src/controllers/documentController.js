import { Document } from "../models/Document.js";
import { createAndSendNotification } from "../services/notificationService.js";

export const uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File is required" });

  const doc = await Document.create({
    ownerId: req.user.id,
    originalName: req.file.originalname,
    storagePath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size
  });

  await createAndSendNotification({
    recipientId: req.user.id,
    type: "document",
    title: "Document uploaded",
    content: `${req.file.originalname} uploaded successfully.`,
    metadata: { documentId: doc._id.toString() }
  });

  res.status(201).json({ document: doc });
};

export const listDocuments = async (req, res) => {
  const docs = await Document.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
  res.json({ documents: docs });
};

export const saveSignature = async (req, res) => {
  const { documentId } = req.params;
  const { signatureImageUrl } = req.body;
  const doc = await Document.findOneAndUpdate(
    { _id: documentId, ownerId: req.user.id },
    { signatureImageUrl, status: "signed" },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Document not found" });
  await createAndSendNotification({
    recipientId: req.user.id,
    type: "document",
    title: "Document signed",
    content: `${doc.originalName} marked as signed.`,
    metadata: { documentId: doc._id.toString() }
  });
  res.json({ document: doc });
};

export const deleteDocument = async (req, res) => {
  const { documentId } = req.params;
  const doc = await Document.findOneAndDelete({ _id: documentId, ownerId: req.user.id });
  if (!doc) return res.status(404).json({ message: "Document not found" });
  return res.json({ message: "Document deleted" });
};
