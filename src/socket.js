import { Server } from "socket.io";

let ioInstance = null;
const userSocketMap = new Map();

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173"
    }
  });

  ioInstance.on("connection", (socket) => {
    socket.on("register-user", (userId) => {
      if (userId) {
        userSocketMap.set(userId.toString(), socket.id);
        socket.data.userId = userId.toString();
      }
    });

    socket.on("send-message", (payload) => {
      const receiverSocketId = userSocketMap.get(payload.receiverId?.toString());
      if (receiverSocketId) {
        ioInstance.to(receiverSocketId).emit("new-message", payload);
      }
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("signal", ({ roomId, payload }) => {
      socket.to(roomId).emit("signal", payload);
    });

    socket.on("call-ended", (roomId) => {
      socket.to(roomId).emit("call-ended");
    });

    socket.on("disconnect", () => {
      if (socket.data?.userId) {
        userSocketMap.delete(socket.data.userId);
      }
    });
  });

  return ioInstance;
};

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  const socketId = userSocketMap.get(userId.toString());
  if (socketId) {
    ioInstance.to(socketId).emit(event, payload);
  }
};
