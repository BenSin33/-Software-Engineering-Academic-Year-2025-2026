
const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'host.docker.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'location_service_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

pool.getConnection()
  .then(connection => {
    console.log(' Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error(' Database connection failed:', err.message);
    process.exit(1);
  });


module.exports = pool;