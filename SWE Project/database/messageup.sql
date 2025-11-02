-- Setup Messaging Database

-- 1. Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS messaging_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE messaging_db;

-- 2. Xóa bảng cũ nếu có (để đảm bảo cấu trúc đúng)
DROP TABLE IF EXISTS messages;

-- 3. Tạo bảng messages
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes để tăng tốc query
  INDEX idx_sender_receiver (senderId, receiverId),
  INDEX idx_created (createdAt),
  INDEX idx_sender (senderId),
  INDEX idx_receiver (receiverId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Thêm dữ liệu mẫu để test
INSERT INTO messages (senderId, receiverId, content, createdAt) VALUES
(1, 101, 'Xin chào! Đây là tin nhắn từ Ban Quản Lý.', NOW() - INTERVAL 2 DAY),
(101, 1, 'Chào Admin! Cảm ơn bạn đã liên hệ.', NOW() - INTERVAL 2 DAY + INTERVAL 5 MINUTE),
(1, 101, 'Chúng tôi xin thông báo về lịch học tuần tới.', NOW() - INTERVAL 1 DAY),
(101, 1, 'Cảm ơn thông tin. Con tôi có thể nghỉ học vào thứ 5 được không?', NOW() - INTERVAL 1 DAY + INTERVAL 30 MINUTE),
(1, 101, 'Được ạ, phụ huynh vui lòng gửi đơn xin nghỉ.', NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR),
(1, 102, 'Xin chào phụ huynh!', NOW() - INTERVAL 3 HOUR),
(102, 1, 'Xin chào Admin!', NOW() - INTERVAL 2 HOUR);

-- 5. Kiểm tra dữ liệu
SELECT 
  id,
  senderId,
  receiverId,
  SUBSTRING(content, 1, 50) as content_preview,
  createdAt
FROM messages
ORDER BY createdAt DESC;

-- 6. Test query giữa Admin (1) và Parent (101)
SELECT * FROM messages
WHERE (senderId = 1 AND receiverId = 101)
   OR (senderId = 101 AND receiverId = 1)
ORDER BY createdAt ASC;

-- 7. Kiểm tra structure
DESCRIBE messages;

-- 8. Hiển thị thông tin database
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';