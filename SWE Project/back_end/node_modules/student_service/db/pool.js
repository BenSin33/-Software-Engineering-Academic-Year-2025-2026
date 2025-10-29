const mysql2 = require('mysql2/promise');

const db = mysql2.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '123456',
  database: process.env.DATABASE || 'students',
});

module.exports = db;