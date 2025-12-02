const queries = require('../db/driverQueries');
const userQueries = require('../db/userQueries');
const { success, error } = require('../utils/response');
const { syncDriverToService, deleteDriverFromService } = require('../utils/syncUtils');
const pool = require('../db/pool');

const getDriversWithoutRoute = async (req, res) => {
  try {
    const drivers = await queries.findDriversWithoutRoute();
    success(res, drivers, 'Danh sách tài xế chưa có tuyến');
  } catch (err) {
    console.error('Error getting drivers without route:', err);
    error(res, 'Không thể lấy danh sách tài xế chưa có tuyến', 500);
  }
};
// Tạo tài xế mới (tự động tạo user account)
const createDriverWithAccount = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { fullName, phoneNumber, email, status } = req.body;
    if (!fullName || !phoneNumber || !email) {
      return error(res, 'Thiếu thông tin bắt buộc', 400);
    }

    await connection.beginTransaction();

    const username = phoneNumber ? `driver_${phoneNumber}` : `driver_${email.split('@')[0]}`;
    const defaultPassword = phoneNumber || 'driver123';

    const userId = await userQueries.createUser(username, defaultPassword, 'R002');
    const driverId = await queries.createDriver(userId, fullName, phoneNumber, email, status, connection);

    await connection.commit();

    try {
      await syncDriverToService({ driverId, userId, fullName, phoneNumber, email, status });
    } catch (syncErr) {
      console.error('Warning: Failed to sync driver to other services:', syncErr);
    }

    success(res, { driverId, userId, username }, 'Tạo tài xế thành công', 201);
  } catch (err) {
    await connection.rollback();
    console.error('Error creating driver:', err);
    error(res, err.message);
  } finally {
    connection.release();
  }
};

// Tạo tài xế mới (dùng userId có sẵn)
const createDriver = async (req, res) => {
  try {
    const { userId, fullName, phoneNumber, email, status } = req.body;
    if (!userId || !fullName || !phoneNumber || !email) {
      return error(res, 'Thiếu thông tin bắt buộc', 400);
    }

    const driverId = await queries.createDriver(userId, fullName, phoneNumber, email, status);
    await syncDriverToService({ driverId, userId, fullName, phoneNumber, email, status });

    success(res, { driverId }, 'Tạo tài xế thành công', 201);
  } catch (err) {
    console.error('Error creating driver:', err);
    error(res, err.message);
  }
};

// Lấy tất cả tài xế
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await queries.getAllDrivers();
    success(res, drivers, 'Lấy danh sách tài xế thành công');
  } catch (err) {
    console.error('Error getting all drivers:', err);
    error(res, err.message);
  }
};

// Lấy tài xế theo DriverID
const getDriverById = async (req, res) => {
  try {
    const driver = await queries.getDriverById(req.params.id);
    if (!driver) return error(res, 'Không tìm thấy tài xế', 404);
    success(res, driver);
  } catch (err) {
    console.error('Error getting driver:', err);
    error(res, err.message);
  }
};

// Lấy tài xế theo UserID
const getDriverByUserId = async (req, res) => {
  try {
    const driver = await queries.getDriverByUserId(req.params.userId);
    if (!driver) return error(res, 'Không tìm thấy tài xế', 404);
    success(res, driver);
  } catch (err) {
    console.error('Error getting driver by userId:', err);
    error(res, err.message);
  }
};

// Cập nhật tài xế
const updateDriver = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, status, routeID, busID } = req.body;
    const driverId = req.params.id;
    
    // --- Bước 1: Update trong database local (driver_service) ---
    await queries.updateDriver(driverId, fullName, phoneNumber, email, status, routeID, busID);

    // --- Bước 2: Sync sang user_service (CHỈ gửi các field user_service cần) ---
    try {
      // ⭐ QUAN TRỌNG: Chỉ sync những field mà user_service chấp nhận
      // Không gửi routeID và busID nếu user_service không có field này
      const syncData = {
        driverId,
        fullName,
        phoneNumber,
        email,
        status
        // ❌ KHÔNG gửi routeID và busID vào đây
      };

      await syncDriverToService(syncData);
      console.log('✅ Đồng bộ user_service thành công');
    } catch (syncErr) {
      // Nếu sync lỗi, chỉ log warning, không fail toàn bộ request
      console.warn('⚠️ Lỗi đồng bộ tài xế sang user_service:', syncErr.message);
      // Có thể return success vì đã update thành công ở database chính
    }

    success(res, null, 'Cập nhật tài xế thành công');
  } catch (err) {
    console.error('❌ Error updating driver:', err);
    error(res, err.message);
  }
};

// Xóa tài xế
const deleteDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    await queries.deleteDriver(driverId);
    await deleteDriverFromService(driverId);
    success(res, null, 'Xóa tài xế thành công');
  } catch (err) {
    console.error('Error deleting driver:', err);
    error(res, err.message);
  }
};

// Lấy thống kê tài xế
const getDriverStats = async (req, res) => {
  try {
    const stats = await queries.getDriverStats();
    success(res, stats, 'Lấy thống kê tài xế thành công');
  } catch (err) {
    console.error('Error getting driver stats:', err);
    error(res, err.message);
  }
};

module.exports = {
  createDriverWithAccount, // khi cần tạo cả user account
  createDriver,            // khi đã có userId
  getAllDrivers,
  getDriverById,
  getDriverByUserId,
  updateDriver,
  deleteDriver,
  getDriverStats,
  getDriversWithoutRoute,
};
