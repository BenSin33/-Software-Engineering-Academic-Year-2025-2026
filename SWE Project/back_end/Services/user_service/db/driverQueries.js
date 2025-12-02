// Import kết nối cơ sở dữ liệu
const pool = require('./pool');
const { v4: uuidv4 } = require('uuid');

// ============================
// Helper: Generate sequential DriverID (Dxxx)
// ============================
const generateNextDriverId = async (connection = null) => {
  const db = connection || pool;
  try {
    const [rows] = await db.query(
      "SELECT DriverID FROM drivers WHERE DriverID LIKE 'D%' ORDER BY LENGTH(DriverID) DESC, DriverID DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return 'D001';
    }

    const lastId = rows[0].DriverID;
    const numericPart = parseInt(lastId.substring(1));
    const nextId = numericPart + 1;

    return `D${nextId.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating DriverID:', error);
    throw error;
  }
};

// ============================
// CREATE DRIVER (Sequential ID)
// ============================
const createDriverSequential = async (userId, fullName, phoneNumber, email, status = 'Active', connection = null) => {
  const db = connection || pool;
  const driverId = await generateNextDriverId(connection);

  try {
    await db.query(
      `INSERT INTO drivers 
       (DriverID, UserID, FullName, PhoneNumber, Email, Status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [driverId, userId, fullName, phoneNumber, email, status || 'Active']
    );
    return driverId;
  } catch (err) {
    console.error('Lỗi khi tạo tài xế (Sequential):', err);
    throw new Error('Không thể tạo tài xế mới: ' + err.message);
  }
};

// ============================
// CREATE DRIVER (UUID)
// ============================
const createDriverUUID = async (userId, fullName, phoneNumber, email, status = 'active') => {
  const driverId = uuidv4();
  try {
    await pool.query(
      `INSERT INTO drivers 
       (DriverID, UserID, FullName, PhoneNumber, Email, Status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [driverId, userId, fullName, phoneNumber, email, status || 'active']
    );
    return driverId;
  } catch (err) {
    console.error('Lỗi khi tạo tài xế (UUID):', err);
    throw new Error('Không thể tạo tài xế mới: ' + err.message);
  }
};

// ============================
// GET ALL DRIVERS
// ============================
const getAllDrivers = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, BusID, RouteID, CreatedAt 
       FROM drivers 
       ORDER BY CreatedAt DESC`
    );
    return rows;
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tài xế:', err);
    throw new Error('Không thể lấy danh sách tài xế: ' + err.message);
  }
};

// ============================
// GET DRIVER BY ID
// ============================
const getDriverById = async (driverId) => {
  try {
    const [rows] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, CreatedAt 
       FROM drivers 
       WHERE DriverID = ?`,
      [driverId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('Lỗi khi lấy tài xế theo ID:', err);
    throw new Error('Không thể lấy thông tin tài xế: ' + err.message);
  }
};

// ============================
// GET DRIVER BY USER ID
// ============================
const getDriverByUserId = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, CreatedAt 
       FROM drivers 
       WHERE UserID = ?`,
      [userId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('Lỗi khi lấy tài xế theo UserID:', err);
    throw new Error('Không thể lấy thông tin tài xế theo UserID: ' + err.message);
  }
};

// ============================
// UPDATE DRIVER
// ============================
const updateDriver = async (driverId, fullName, phoneNumber, email, status) => {
  try {
    // Nếu status là Inactive, tự động xóa BusID và RouteID
    let query, params;

    if (status === 'Inactive') {
      query = `UPDATE drivers 
               SET FullName = ?, PhoneNumber = ?, Email = ?, Status = ?, 
                   BusID = NULL, RouteID = NULL, UpdatedAt = NOW()
               WHERE DriverID = ?`;
      params = [fullName, phoneNumber, email, status, driverId];
    } else {
      query = `UPDATE drivers 
               SET FullName = ?, PhoneNumber = ?, Email = ?, Status = ?, UpdatedAt = NOW()
               WHERE DriverID = ?`;
      params = [fullName, phoneNumber, email, status, driverId];
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy tài xế để cập nhật');
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật tài xế:', err);
    throw new Error('Cập nhật tài xế thất bại: ' + err.message);
  }
};

// ============================
// DELETE DRIVER
// ============================
const deleteDriver = async (driverId) => {
  try {
    // Kiểm tra trạng thái và phân công của tài xế trước khi xóa
    const [driver] = await pool.query(
      'SELECT Status, BusID, RouteID FROM drivers WHERE DriverID = ?',
      [driverId]
    );

    if (driver.length === 0) {
      throw new Error('Không tìm thấy tài xế để xóa');
    }

    const driverData = driver[0];

    // Kiểm tra nếu tài xế đang có trạng thái Active
    if (driverData.Status === 'Active') {
      throw new Error('Không thể xóa tài xế đang hoạt động. Vui lòng chuyển trạng thái về "Đang nghỉ" trước khi xóa.');
    }

    // Kiểm tra nếu tài xế vẫn còn được phân công xe hoặc tuyến
    if (driverData.BusID || driverData.RouteID) {
      throw new Error('Không thể xóa tài xế đang được phân công. Vui lòng chuyển trạng thái về "Đang nghỉ" để tự động hủy phân công trước khi xóa.');
    }

    // Nếu tất cả điều kiện đều thỏa mãn, thực hiện xóa
    const [result] = await pool.query(
      'DELETE FROM drivers WHERE DriverID = ?',
      [driverId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy tài xế để xóa');
    }
  } catch (err) {
    console.error('Lỗi khi xóa tài xế:', err);
    throw new Error(err.message || 'Xóa tài xế thất bại');
  }
};

// ============================
// DRIVER STATS
// ============================
const getDriverStats = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN Status = 'Inactive' THEN 1 ELSE 0 END) as rest
       FROM drivers`
    );
    return rows[0] || { total: 0, active: 0, rest: 0 };
  } catch (err) {
    console.error('Lỗi khi lấy thống kê tài xế:', err);
    throw new Error('Không thể lấy thống kê tài xế: ' + err.message);
  }
};

const getActiveDrivers = async () => {
  try {
    // Chỉ lấy DriverID và FullName, và chỉ lấy Status = 'Active'
    const [rows] = await pool.query(
      `SELECT DriverID, FullName 
       FROM drivers 
       WHERE Status = 'Active' 
       ORDER BY FullName ASC`
    );
    return rows;
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tài xế active:', err);
    throw new Error('Không thể lấy danh sách tài xế active: ' + err.message);
  }
};

module.exports = {
  createDriver: createDriverSequential,
  createDriverSequential,
  createDriverUUID,
  getAllDrivers,
  getDriverById,
  getDriverByUserId,
  updateDriver,
  deleteDriver,
  getDriverStats,
  getActiveDrivers
};
