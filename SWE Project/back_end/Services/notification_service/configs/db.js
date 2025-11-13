// file: config/db.js
const mysql = require('mysql2/promise');

// Tạo một connection pool
const pool = mysql.createPool({
  host: 'localhost',      // hoặc IP của MySQL server
  user: 'root',           // Tên user của bạn
  password: 'your_password', // Mật khẩu của bạn
  database: 'schoolbus_notifications', // Tên database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('MySQL connection pool created successfully.');

// Export pool để các file khác có thể sử dụng
module.exports = pool;