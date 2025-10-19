import { Server } from "socket.io";
import MessageService from "../services/message.service";

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("👋 A user connected:", socket.id);

    // Khi client gửi tin nhắn
    socket.on("sendMessage", async (data) => {
      const savedMessage = await MessageService.saveMessage(data);
      io.emit("newMessage", savedMessage); // broadcast cho mọi người
    });

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);
    });
  });
}
