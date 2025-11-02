const MessageService=require('../services/message.service')

exports.messageHistory = async function(req,res){
   const {senderID,receiverID}=req.params;
   const messages = await MessageService.getMessages(senderID,receiverID);
   res.json(messages)
}

exports.sendMessage = async function(req,res){
   try {
      const {senderId, receiverId, content} = req.body;
      
      if (!senderId || !receiverId || !content) {
         return res.status(400).json({ 
            success: false, 
            message: 'Thiếu thông tin senderId, receiverId hoặc content' 
         });
      }

      const messageData = {
         senderId: parseInt(senderId),
         receiverId: parseInt(receiverId),
         content: content
      };

      const savedMessage = await MessageService.saveMessage(messageData);
      res.status(201).json({ 
         success: true, 
         data: savedMessage 
      });
   } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      
      // Trả về error message chi tiết
      let errorMessage = 'Lỗi server khi gửi tin nhắn';
      
      // Kiểm tra các lỗi phổ biến
      if (error.code === 'ER_NO_SUCH_TABLE') {
         errorMessage = 'Bảng messages không tồn tại. Vui lòng tạo database và bảng messages.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
         errorMessage = 'Không thể kết nối đến database. Vui lòng kiểm tra cấu hình database.';
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
         errorMessage = 'Lỗi xác thực database. Vui lòng kiểm tra username và password.';
      } else if (error.message) {
         errorMessage = error.message;
      }
      
      res.status(500).json({ 
         success: false, 
         message: errorMessage,
         errorCode: error.code || 'UNKNOWN_ERROR'
      });
   }
}