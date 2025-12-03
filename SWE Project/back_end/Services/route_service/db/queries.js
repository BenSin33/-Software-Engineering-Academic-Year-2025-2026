const pool = require('./pool');

async function getRoutes() {
  let rows;
  try {
    // 1. Kiểm tra Pool hoạt động với lệnh đơn giản (SELECT 1)
    console.log("-----------------------------------------");
    console.log("➡️ Bắt đầu kiểm tra Pool (SELECT 1)");
    const [testRows] = await pool.query('SELECT 1 as is_working'); 
    
    // Log kết quả kiểm tra Pool
    console.log("✅ Pool hoạt động! Dữ liệu kiểm tra:", testRows);
    
    if (testRows.length === 0) {
        console.error("❌ Lỗi cấu trúc pool: SELECT 1 không trả về kết quả.");
        throw new Error("Pool check failed: SELECT 1 returned empty.");
    }
    
    // 2. Thực hiện truy vấn thực tế
    console.log("➡️ Bắt đầu truy vấn thực tế: SELECT * FROM routes");
    // Sử dụng tên bảng là 'routes' (chữ thường) theo xác nhận của bạn
    [rows] = await pool.query('SELECT * FROM routes');
    
    console.log("✅ Truy vấn thành công!");
    
    // 3. Kiểm tra dữ liệu
    if (!rows || rows.length === 0) {
      console.warn("⚠️ Truy vấn trả về MẢNG RỖNG. Dữ liệu không tồn tại hoặc lỗi SQL ẩn.");
    } else {
      console.log(`✅ Đã tìm thấy ${rows.length} bản ghi.`);
      // Log ra một phần dữ liệu để xác nhận
      console.log("Dữ liệu mẫu (Route đầu tiên):", JSON.stringify(rows[0])); 
    }

    // Đảm bảo luôn trả về mảng để routeController không bị lỗi
    return Array.isArray(rows) ? rows : [];

  } catch (error) {
    // Nếu bị lỗi kết nối, timeout hoặc lỗi SQL, nó sẽ bị bắt ở đây
    console.error("❌ LỖI KHI THỰC HIỆN TRUY VẤN:", error.message);
    // Ném lỗi ra để Controller bắt và trả về HTTP 500
    throw error; 
  } finally {
    console.log("-----------------------------------------");
  }
}

async function getRouteByID(RouteID){
  const [rows] = await pool.query('SELECT * from routes where RouteID = ?',[RouteID])
  return rows;
}
async function addRoute(driverID,busID,routeName,startLocation,endLocation,status) {
  const sql = `
    INSERT INTO routes
      (driverID,busID,routeName,startLocation,endLocation,Status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

 const [routeID] = await pool.query(sql, [driverID,busID,routeName,startLocation,endLocation,status]);
 return routeID.insertId;
}

async function updateCurrentRoute(routeID,driverID,busID,routeName,startLocation,endLocation,status){
  
  const sql =`
  update routes set driverID=?,busID=?,routeName=?,startLocation=?,endLocation=?, Status=? where routeID = ?;
  `
  await pool.query(sql,[driverID,busID,routeName,startLocation,endLocation,status,routeID])
}

async function deleteRoute(routeID){
  const sql=`delete from routes where RouteID= ?`
  await pool.query(sql,[routeID])
}
module.exports = {
  getRoutes,
  addRoute,
  updateCurrentRoute,
  deleteRoute,getRouteByID
};