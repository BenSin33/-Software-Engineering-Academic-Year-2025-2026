// back_end/API_gateway/routes/messageRoutes.js - FIXED VERSION

const express = require("express");
const { callService } = require("../services/callService.js");

const router = express.Router();

/**
 * 🟢 GET /messages/:senderID/:receiverID
 * Lấy lịch sử tin nhắn giữa 2 người
 */
router.get("/:senderID/:receiverID", async (req, res) => {
  try {
    const { senderID, receiverID } = req.params;
    
    console.log(`📥 [API Gateway] GET messages: ${senderID} <-> ${receiverID}`);
    
    const messages = await callService(
      "messaging_service",
      `/messages/${senderID}/${receiverID}`,
      "GET"
    );
    
    console.log(`✅ [API Gateway] Messages retrieved:`, messages);
    
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error("❌ [API Gateway] Lỗi khi lấy lịch sử tin nhắn:", err);
    
    // Xử lý lỗi chi tiết
    let statusCode = 500;
    let errorMessage = "Lỗi server khi lấy lịch sử tin nhắn";
    
    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('fetch failed')) {
      statusCode = 503;
      errorMessage = "Messaging Service không khả dụng. Vui lòng kiểm tra service đang chạy trên port 5002";
    } else if (err.status) {
      statusCode = err.status;
      errorMessage = err.message;
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err.message
    });
  }
});

/**
 * ➕ POST /messages
 * Gửi tin nhắn mới
 */
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    console.log(`📤 [API Gateway] POST message:`, { senderId, receiverId, content: content?.substring(0, 50) });

    // Validate input
    if (!senderId || !receiverId || !content) {
      console.error("❌ [API Gateway] Thiếu thông tin");
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin senderId, receiverId hoặc content",
      });
    }

    const messageData = { senderId, receiverId, content };
    
    const result = await callService(
      "messaging_service",
      "/messages",
      "POST",
      messageData
    );

    console.log(`✅ [API Gateway] Message sent:`, result);

    return res.status(201).json({
      success: true,
      data: result.data || result,
    });
  } catch (err) {
    console.error("❌ [API Gateway] Lỗi khi gửi tin nhắn:", err);
    
    // Kiểm tra nếu là lỗi connection (service chưa chạy)
    let errorMessage = err.message || "Lỗi server khi gửi tin nhắn";
    let statusCode = err.status || 500;
    
    if (err.cause?.code === 'ECONNREFUSED' || 
        err.message?.includes('ECONNREFUSED') || 
        err.message?.includes('fetch failed')) {
      errorMessage = "Messaging Service không khả dụng. Vui lòng:\n1. Kiểm tra service đang chạy: cd back_end/Services/messaging_service && npm start\n2. Kiểm tra port 5002 không bị chiếm dụng\n3. Kiểm tra database connection";
      statusCode = 503; // Service Unavailable
      console.error("⚠️ [API Gateway] Không thể kết nối đến Messaging Service");
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err.message
    });
  }
});

module.exports = router;