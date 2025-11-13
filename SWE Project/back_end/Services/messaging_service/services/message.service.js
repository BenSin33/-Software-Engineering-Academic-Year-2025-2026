// services/message.service.js
const pool = require('../db/pool');

const MessageService = {
  async getMessages(senderId, receiverId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM messages
         WHERE (senderId = ? AND receiverId = ?)
         OR (senderId = ? AND receiverId = ?)
         ORDER BY createdAt ASC`,
        [senderId, receiverId, receiverId, senderId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  async saveMessage(data) {
    const connection = await pool.getConnection();
    try {
      // Execute insert query
      const [result] = await connection.execute(
        `INSERT INTO messages (senderId, receiverId, content, createdAt)
         VALUES (?, ?, ?, NOW())`,
        [data.senderId, data.receiverId, data.content]
      );
      
      // Get the inserted ID
      const insertId = result.insertId;
      
      // Fetch the complete message with timestamp
      const [rows] = await connection.execute(
        `SELECT * FROM messages WHERE id = ?`,
        [insertId]
      );
      
      // Return the saved message
      return rows[0] || { 
        id: insertId, 
        senderId: data.senderId, 
        receiverId: data.receiverId, 
        content: data.content,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in saveMessage:', error);
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = MessageService;