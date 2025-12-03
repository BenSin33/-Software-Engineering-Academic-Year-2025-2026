const mysql2 = require('mysql2/promise');
require('dotenv').config();

const db = mysql2.createPool({
  host: process.env.DB_HOST || 'host.docker.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'routes',
  
  // Cấu hình Pool
  waitForConnections: true, // Nếu Pool đầy, chờ cho đến khi có kết nối trống
  connectionLimit: 10,
  queueLimit: 0,
  
  // Thêm cấu hình Keep Alive và Timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 15000, // Tăng thời gian chờ kết nối ban đầu lên 15 giây
  acquireTimeout: 10000 // Thêm thời gian chờ để lấy kết nối từ Pool (10 giây)
});

// --- DEBUGGING POOL EVENTS ---
// Log khi Pool bị lỗi (rất quan trọng)
db.on('error', (err) => {
    console.error('❌ LỖI POOL DB TỔNG QUÁT (Mất kết nối giữa chừng):', err.code, err.message);
});

// Log khi yêu cầu kết nối phải xếp hàng (Pool bị đầy)
db.on('enqueue', () => {
    console.warn(`[DEBUG POOL] Yêu cầu kết nối đang xếp hàng. Pool có thể bị đầy.`);
});
// -----------------------------


// Test connection khi khởi động
db.getConnection()
  .then(connection => {
    console.log('✅ Route Service Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Route Service Database connection failed (Host: %s):', process.env.DB_HOST, err.message);
    console.error("!!! Dịch vụ Route Service bị thoát (exit 1) do lỗi kết nối DB.");
    process.exit(1);
  });

module.exports = db;