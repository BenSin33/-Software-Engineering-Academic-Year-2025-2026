const {Router} = require('express');
const messageRouter= Router();
const messageController= require('../controllers/message.controller')

// Lấy lịch sử tin nhắn giữa 2 người
messageRouter.get('/:senderID/:receiverID',messageController.messageHistory)

// Gửi tin nhắn qua REST API
messageRouter.post('/',messageController.sendMessage)

// THÊM DÒNG NÀY:
module.exports = messageRouter;