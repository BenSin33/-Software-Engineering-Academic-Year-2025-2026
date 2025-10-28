const queries = require('../db/parentQueries');
const { success, error } = require('../utils/response');

const createParent = async (req, res) => {
  try {
    const { userId, trackingId, fullName, phoneNumber, email, address } = req.body;
    const parentId = await queries.createParent(userId, trackingId, fullName, phoneNumber, email, address);
    success(res, { parentId }, 'Tạo phụ huynh thành công', 201);
  } catch (err) {
    error(res);
  }
};

const getParentById = async (req, res) => {
  try {
    const parent = await queries.getParentById(req.params.id);
    if (!parent) return error(res, 'Không tìm thấy phụ huynh', 404);
    success(res, parent);
  } catch (err) {
    error(res);
  }
};

const updateParent = async (req, res) => {
  try {
    const { trackingId, fullName, phoneNumber, email, address } = req.body;
    await queries.updateParent(req.params.id, trackingId, fullName, phoneNumber, email, address);
    success(res, null, 'Cập nhật phụ huynh thành công');
  } catch (err) {
    error(res);
  }
};

const deleteParent = async (req, res) => {
  try {
    await queries.deleteParent(req.params.id);
    success(res, null, 'Xóa phụ huynh thành công');
  } catch (err) {
    error(res);
  }
};

module.exports = { createParent, getParentById, updateParent, deleteParent };