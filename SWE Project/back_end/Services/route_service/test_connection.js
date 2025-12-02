const mysql = require('mysql2/promise');

async function test() {
  try {
    console.log("1. Đang kết nối Database...");
    const connection = await mysql.createConnection({
      host: 'localhost', // Test chạy máy thật thì dùng localhost
      user: 'root',
      password: '',      // Điền pass của bạn
      database: 'routes' // Tên database bạn thấy có dữ liệu
    });

    console.log("2. Kết nối thành công! Đang query...");
    
    // Test query đơn giản nhất
    const [rows] = await connection.execute('SELECT * FROM routes');
    
    console.log("3. KẾT QUẢ:");
    console.log("--> Tổng số dòng:", rows.length);
    console.log("--> Dữ liệu:", rows);

    await connection.end();
  } catch (error) {
    console.error("❌ LỖI:", error.message);
  }
}

test();