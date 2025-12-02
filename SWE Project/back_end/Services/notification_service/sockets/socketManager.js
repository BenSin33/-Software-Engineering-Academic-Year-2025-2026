let ioInstance = null;
const userSocketMap = new Map(); // { userId -> socket.id }

/**
 * Khởi tạo và quản lý các kết nối Socket.IO
 * @param {import('socket.io').Server} io
 */
function setupSocketManager(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] Một người dùng đã kết nối: ${socket.id}`);

    // Lắng nghe sự kiện 'register' từ client
    // Client (frontend) phải gửi sự kiện này cùng với userId của họ sau khi kết nối
    socket.on('register', (userId) => {
      if (!userId) return;
      console.log(`[Socket] Đăng ký: User ${userId} với socket ${socket.id}`);
      userSocketMap.set(String(userId), socket.id); // Đảm bảo userId là string
    });

    // Xử lý khi người dùng ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`[Socket] Người dùng ngắt kết nối: ${socket.id}`);
      // Xóa user này khỏi map
      for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`[Socket] Hủy đăng ký: User ${userId}`);
          break;
        }
      }
    });
  });
}

/**
 * Gửi thông báo đến một người dùng cụ thể
 * @param {string} recipientId ID của người nhận
 * @param {object} notification Nội dung thông báo (đã lưu từ DB)
 */
function sendNotification(recipientId, notification) {
  if (!ioInstance) {
    console.error('[Socket] Lỗi: Socket.IO chưa được khởi tạo!');
    return;
  }

  const socketId = userSocketMap.get(String(recipientId)); // Đảm bảo key là string

  if (socketId) {
    // Gửi sự kiện 'new_notification' đến đúng client đó
    ioInstance.to(socketId).emit('new_notification', notification);
    console.log(`[Socket] Đã gửi thông báo cho user ${recipientId} tại socket ${socketId}`);
  } else {
    console.log(`[Socket] Không tìm thấy user ${recipientId} đang online. Thông báo đã được lưu vào DB.`);
  }
}

module.exports = { setupSocketManager, sendNotification };