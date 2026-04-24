import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// routes
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import collaborationRequestRoutes from "./routes/collaborationRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import { errorHandler, notFound } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet());

// ✅ FIXED CORS (IMPORTANT)
const allowedOrigins = [
  "http://localhost:5173",
  "https://nexus-frontend-nine-jet.vercel.app"
  
];

// optional env support (production best practice)
if (process.env.CLIENT_URLS) {
  allowedOrigins.push(...process.env.CLIENT_URLS.split(",").map(o => o.trim()));
}

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server or postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false); // reject others
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// routes
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Business Nexus backend is running"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/collaboration-requests", collaborationRequestRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);