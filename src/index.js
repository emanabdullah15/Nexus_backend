import dotenv from "dotenv";
import http from "http";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";

dotenv.config();

const port = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });