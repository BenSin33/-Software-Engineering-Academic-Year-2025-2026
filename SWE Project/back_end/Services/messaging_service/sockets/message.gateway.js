const { Server } = require("socket.io");
const MessageService = require("../services/message.service");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("👋 A user connected:", socket.id);

    // Khi client gửi tin nhắn
    socket.on("sendMessage", async (data) => {
      try {
        const savedMessage = await MessageService.saveMessage(data);
        io.emit("newMessage", savedMessage); // broadcast cho mọi người
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);
    });
  });
}

module.exports = { setupSocket };