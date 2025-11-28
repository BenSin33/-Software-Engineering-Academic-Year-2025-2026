require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'log_database',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error(' Database connection failed:', err.message);
    process.exit(1);
  }
  console.log(' Database connected successfully');
  connection.release();
});

pool.on('error', (err) => {
  console.error(' Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing database pool:', err);
    } else {
      console.log('Database pool closed');
    }
    process.exit(err ? 1 : 0);
  });
});

module.exports = promisePool;