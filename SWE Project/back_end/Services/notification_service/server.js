const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dbPool = require('./config/db'); // Chỉ import để kiểm tra kết nối
const startNotificationConsumer = require('./services/notificationConsumer');
const { setupSocketManager } = require('./sockets/socketManager');

const PORT = 5003; // Cổng riêng cho service này

const app = express();
app.use(cors());

// Khởi tạo server HTTP từ Express
const server = http.createServer(app);

// Khởi tạo Socket.IO server, đính kèm vào server HTTP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Cổng frontend Next.js
    methods: ["GET", "POST"]
  }
});

// Thiết lập trình quản lý socket
setupSocketManager(io);

// API kiểm tra sức khỏe của service (tùy chọn)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Khởi động server
server.listen(PORT, () => {
  console.log(`[Server] Notification Service đang chạy trên cổng ${PORT}`);
  
  // Khởi động trình lắng nghe RabbitMQ
  startNotificationConsumer();
});