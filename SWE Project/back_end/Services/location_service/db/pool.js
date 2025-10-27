const mysql2 = require('mysql2/promise');

const db = mysql2.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || 'location_service_db', // ← Đổi default này
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
db.getConnection()
  .then(connection => {
    console.log('✅ Location Service: Database connected successfully');
    console.log('📊 Connected to:', process.env.DATABASE); // ← Thêm log này
    connection.release();
  })
  .catch(err => {
    console.error('❌ Location Service: Database connection failed:', err.message);
  });

module.exports = db;