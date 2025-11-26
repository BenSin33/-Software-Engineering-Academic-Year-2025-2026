// Model definition (nếu dùng Prisma hoặc ORM khác)
// Hiện tại dùng raw SQL nên file này có thể để trống hoặc định nghĩa schema

const MessageSchema = {
    id: 'INT PRIMARY KEY AUTO_INCREMENT',
    senderId: 'INT NOT NULL',
    receiverId: 'INT NOT NULL',
    content: 'TEXT NOT NULL',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  };
  
  module.exports = MessageSchema;