// file: services/notificationConsumer.js
const amqp = require('amqplib');
const dbPool = require('../config/db'); // Import connection pool

async function startNotificationConsumer(sendNotification) {
  try {
    const connection = await amqp.connect('amqp://guest:guest@localhost');
    const channel = await connection.createChannel();
    const queue = 'notifications_queue';

    await channel.assertQueue(queue, { durable: true });
    console.log(`[*] Waiting for messages in queue: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.log('[x] Received notification job:', content);

        try {
          // 1. Lưu thông báo vào MySQL
          const sql = 'INSERT INTO notifications (recipientId, message) VALUES (?, ?)';
          const [result] = await dbPool.execute(sql, [content.recipientId, content.message]);
          const insertId = result.insertId;

          // Lấy lại thông báo vừa lưu để gửi qua socket
          const [rows] = await dbPool.execute('SELECT * FROM notifications WHERE id = ?', [insertId]);
          const savedNotification = rows[0];

          // 2. Gửi thông báo real-time qua Socket.IO
          sendNotification(content.recipientId, savedNotification);

          // 3. Xác nhận đã xử lý xong tin nhắn với RabbitMQ
          channel.ack(msg);

        } catch (dbError) {
          console.error('Failed to save notification to MySQL:', dbError);
          // Cân nhắc việc không ack(msg) để RabbitMQ có thể thử gửi lại
        }
      }
    });
  } catch (error) {
    console.error('Error in RabbitMQ consumer:', error);
  }
}

module.exports = startNotificationConsumer;