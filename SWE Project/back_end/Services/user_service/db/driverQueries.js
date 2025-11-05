// Import thư viện uuid để tạo mã định danh duy nhất cho mỗi tài xế
const { v4: uuidv4 } = require('uuid');

// Import kết nối cơ sở dữ liệu từ file pool.js
const pool = require('./pool');

// Hàm tạo mới một tài xế trong cơ sở dữ liệu
const createDriver = async (userId, fullName, phoneNumber, email, status) => {
  const driverId = uuidv4(); // Tạo mã DriverID duy nhất
  try {
    // Thực hiện câu lệnh SQL để thêm tài xế vào bảng drivers
    await pool.query(
      'INSERT INTO drivers (DriverID, UserID, FullName, PhoneNumber, Email, Status) VALUES (?, ?, ?, ?, ?, ?)',
      [driverId, userId, fullName, phoneNumber, email, status]
    );
    return driverId; // Trả về DriverID vừa tạo
  } catch (error) {
    // Nếu có lỗi xảy ra, ghi log và ném lỗi ra ngoài
    console.error('Error creating driver:', error);
    throw error;
  }
};

// Hàm lấy thông tin tài xế theo DriverID
const getDriverById = async (driverId) => {
  try {
    // Truy vấn cơ sở dữ liệu để lấy thông tin tài xế
    const [rows] = await pool.query('SELECT * FROM drivers WHERE DriverID = ?', [driverId]);
    return rows[0]; // Trả về dòng đầu tiên (tài xế tương ứng)
  } catch (error) {
    // Ghi log nếu có lỗi và ném lỗi ra ngoài
    console.error('Error fetching driver:', error);
    throw error;
  }
};

// Hàm cập nhật thông tin tài xế theo DriverID
const updateDriver = async (driverId, fullName, phoneNumber, email, status) => {
  try {
    // Thực hiện câu lệnh SQL để cập nhật thông tin tài xế
    await pool.query(
      'UPDATE drivers SET FullName = ?, PhoneNumber = ?, Email = ?, Status = ? WHERE DriverID = ?',
      [fullName, phoneNumber, email, status, driverId]
    );
  } catch (error) {
    // Ghi log nếu có lỗi và ném lỗi ra ngoài
    console.error('Error updating driver:', error);
    throw error;
  }
};

// Hàm xoá tài xế khỏi cơ sở dữ liệu theo DriverID
const deleteDriver = async (driverId) => {
  try {
    // Thực hiện câu lệnh SQL để xoá tài xế
    await pool.query('DELETE FROM drivers WHERE DriverID = ?', [driverId]);
  } catch (error) {
    // Ghi log nếu có lỗi và ném lỗi ra ngoài
    console.error('Error deleting driver:', error);
    throw error;
  }
};

// Xuất các hàm để sử dụng ở các module khác
module.exports = { createDriver, getDriverById, updateDriver, deleteDriver };