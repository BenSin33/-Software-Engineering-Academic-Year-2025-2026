// Import thư viện uuid để tạo mã định danh duy nhất
const { v4: uuidv4 } = require('uuid');

// Import kết nối cơ sở dữ liệu
const pool = require('./pool');

// Tạo tài xế mới
const createDriver = async (userId, fullName, phoneNumber, email, status = 'active') => {
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
    console.error('Lỗi khi tạo tài xế:', err);
    throw new Error('Không thể tạo tài xế mới: ' + err.message);
  }
};

// Lấy tất cả tài xế
const getAllDrivers = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, CreatedAt 
       FROM drivers 
       ORDER BY CreatedAt DESC`
    );
    return rows;
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tài xế:', err);
    throw new Error('Không thể lấy danh sách tài xế: ' + err.message);
  }
};

// Lấy tài xế theo DriverID
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

// Lấy tài xế theo UserID (rất quan trọng để liên kết với tài khoản người dùng)
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

// Cập nhật thông tin tài xế
const updateDriver = async (driverId, fullName, phoneNumber, email, status) => {
  try {
    const [result] = await pool.query(
      `UPDATE drivers 
       SET FullName = ?, PhoneNumber = ?, Email = ?, Status = ?, UpdatedAt = NOW()
       WHERE DriverID = ?`,
      [fullName, phoneNumber, email, status, driverId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy tài xế để cập nhật');
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật tài xế:', err);
    throw new Error('Cập nhật tài xế thất bại: ' + err.message);
  }
};

// Xóa tài xế (xóa cứng)
const deleteDriver = async (driverId) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM drivers WHERE DriverID = ?',
      [driverId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy tài xế để xóa');
    }
  } catch (err) {
    console.error('Lỗi khi xóa tài xế:', err);
    throw new Error('Xóa tài xế thất bại: ' + err.message);
  }
};

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  getDriverByUserId,
  updateDriver,
  deleteDriver
};