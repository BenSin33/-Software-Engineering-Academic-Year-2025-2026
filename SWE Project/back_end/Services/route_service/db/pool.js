const mysql2 = require('mysql2/promise');
require('dotenv').config();

const db = mysql2.createPool({
  host: process.env.DB_HOST || 'host.docker.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'routes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection khi khởi động
db.getConnection()
  .then(connection => {
    console.log('✅ Route Service Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Route Service Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = db;