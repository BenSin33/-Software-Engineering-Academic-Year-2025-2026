const mysql2 = require('mysql2/promise');

const db = mysql2.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || 'routes',
});

module.exports = db;