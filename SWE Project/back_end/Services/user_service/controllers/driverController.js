const queries = require('../db/driverQueries');
const { success, error } = require('../utils/response');

const createDriver = async (req, res) => {
  try {
    const { userId, fullName, phoneNumber, email, status } = req.body;
    const driverId = await queries.createDriver(userId, fullName, phoneNumber, email, status);
    success(res, { driverId }, 'Tạo tài xế thành công', 201);
  } catch (err) {
    error(res);
  }
};

const getDriverById = async (req, res) => {
  try {
    const driver = await queries.getDriverById(req.params.id);
    if (!driver) return error(res, 'Không tìm thấy tài xế', 404);
    success(res, driver);
  } catch (err) {
    error(res);
  }
};

const updateDriver = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, status } = req.body;
    await queries.updateDriver(req.params.id, fullName, phoneNumber, email, status);
    success(res, null, 'Cập nhật tài xế thành công');
  } catch (err) {
    error(res);
  }
};

const deleteDriver = async (req, res) => {
  try {
    await queries.deleteDriver(req.params.id);
    success(res, null, 'Xóa tài xế thành công');
  } catch (err) {
    error(res);
  }
};

module.exports = { createDriver, getDriverById, updateDriver, deleteDriver };