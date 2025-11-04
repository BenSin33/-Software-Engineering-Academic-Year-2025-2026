USE messaging_db;

-- Xóa tin nhắn cũ của Phạm Văn Nam (U007 = 7)
DELETE FROM messages WHERE senderId = 7 OR receiverId = 7;

-- Thêm tin nhắn mẫu cho Nguyễn Thị Lan (U004 = 4)
INSERT INTO messages (senderId, receiverId, content, createdAt) VALUES
-- Admin gửi cho Nguyễn Thị Lan
(1, 4, 'Xin chào phụ huynh Nguyễn Thị Lan! Chúng tôi xin thông báo về lịch học tuần tới.', NOW() - INTERVAL 2 HOUR),

-- Nguyễn Thị Lan trả lời
(4, 1, 'Cảm ơn thầy/cô. Con tôi có thể nghỉ học vào thứ 5 được không?', NOW() - INTERVAL 1 HOUR + INTERVAL 30 MINUTE),

-- Admin trả lời
(1, 4, 'Được ạ, phụ huynh vui lòng gửi đơn xin nghỉ học.', NOW() - INTERVAL 1 HOUR),

-- Nguyễn Thị Lan gửi
(4, 1, 'Dạ con tôi sẽ gửi đơn vào sáng mai. Cảm ơn thầy/cô!', NOW() - INTERVAL 30 MINUTE),

-- Admin xác nhận
(1, 4, 'Cảm ơn phụ huynh đã hợp tác!', NOW() - INTERVAL 10 MINUTE);

-- Kiểm tra tin nhắn
SELECT 
  id,
  CASE 
    WHEN senderId = 1 THEN 'Admin'
    WHEN senderId = 4 THEN 'Nguyễn Thị Lan'
    ELSE CONCAT('User ', senderId)
  END as sender,
  CASE 
    WHEN receiverId = 1 THEN 'Admin'
    WHEN receiverId = 4 THEN 'Nguyễn Thị Lan'
    ELSE CONCAT('User ', receiverId)
  END as receiver,
  content,
  createdAt
FROM messages
WHERE (senderId = 1 AND receiverId = 4) OR (senderId = 4 AND receiverId = 1)
ORDER BY createdAt ASC;