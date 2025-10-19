// services/message.service.js
const db = require('../db/queries'); // kết nối mysql
const Message = require('../models/message.model'); // cái này sẽ chữa các định nghĩa bảng csdl thường dùng với prisma ORM

const MessageService = {
  async getMessages(senderId, receiverId) {
    const [rows] = await db.query(
      `SELECT * FROM messages
       WHERE (senderId = ? AND receiverId = ?)
       OR (senderId = ? AND receiverId = ?)
       ORDER BY createdAt ASC`,
      [senderId, receiverId, receiverId, senderId]
    );
    return rows;
  },

  async saveMessage(data) {
    const [result] = await db.query(
      `INSERT INTO messages (senderId, receiverId, content, createdAt)
       VALUES (?, ?, ?, NOW())`,
      [data.senderId, data.receiverId, data.content]
    );
    return { id: result.insertId, ...data };
  },
};

module.exports = MessageService;