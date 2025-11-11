// bus_service/scripts/initDatabase.js
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến MySQL...');
    
    // Kết nối không chỉ định database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log(' Kết nối thành công!');
    console.log('📂 Đang đọc file schema.sql...');

    // Đọc file SQL
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    console.log('⚙️  Đang thực thi schema...');
    await connection.query(schema);

    console.log(' Khởi tạo database thành công!');
    console.log('📊 Database: bus_service_db');
    console.log('📋 Bảng: Buses, Drivers');
    console.log('📝 Dữ liệu mẫu đã được thêm');
    
  } catch (error) {
    console.error(' Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối');
    }
  }
}

// Chạy script
initDatabase();