const queries = require('../db/driverQueries');
const { success, error } = require('../utils/response');
const { syncDriverToService, deleteDriverFromService } = require('../utils/syncUtils');

// Tạo tài xế mới
const createDriver = async (req, res) => {
  try {
    const { userId, fullName, phoneNumber, email, status } = req.body;
    const driverId = await queries.createDriver(userId, fullName, phoneNumber, email, status);

    //  Đồng bộ sang service khác
    await syncDriverToService({ driverId, userId, fullName, phoneNumber, email, status });

    success(res, { driverId }, 'Tạo tài xế thành công', 201);
  } catch (err) {
    console.error('Error creating driver:', err);
    error(res);
  }
};

// Lấy thông tin tài xế theo ID
const getDriverById = async (req, res) => {
  try {
    const driver = await queries.getDriverById(req.params.id);
    if (!driver) return error(res, 'Không tìm thấy tài xế', 404);
    success(res, driver);
  } catch (err) {
    console.error('Error fetching driver by ID:', err);
    error(res);
  }
};

// Cập nhật thông tin tài xế
const updateDriver = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, status } = req.body;
    const driverId = req.params.id;

    await queries.updateDriver(driverId, fullName, phoneNumber, email, status);

    //  Đồng bộ sang service khác
    await syncDriverToService({ driverId, fullName, phoneNumber, email, status });

    success(res, null, 'Cập nhật tài xế thành công');
  } catch (err) {
    console.error('Error updating driver:', err);
    error(res);
  }
};

// Xóa tài xế khỏi hệ thống
const deleteDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    await queries.deleteDriver(driverId);

    //  Đồng bộ xóa sang service khác
    await deleteDriverFromService(driverId);

    success(res, null, 'Xóa tài xế thành công');
  } catch (err) {
    console.error('Error deleting driver:', err);
    error(res);
  }
};

module.exports = {
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver
};