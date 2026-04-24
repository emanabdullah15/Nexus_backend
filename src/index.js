import dotenv from "dotenv";
import http from "http";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(
      `Port ${port} is already in use. Another backend instance is running. Stop it first or change PORT in .env.`
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.error("Server startup error:", error.message);
  process.exit(1);
});

initSocket(server);

connectDB()
  .then(() => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Startup failed:", error.message);
    process.exit(1);
  });
