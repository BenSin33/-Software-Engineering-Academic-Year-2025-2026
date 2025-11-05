const queries = require('../db/parentQueries');
const { success, error } = require('../utils/response');
const { syncParentToService, deleteParentFromService } = require('../utils/syncUtils');

// Tạo parent mới
const createParent = async (req, res) => {
  try {
    const { userId, trackingId, fullName, phoneNumber, email, address } = req.body;

    if (!userId || !fullName || !phoneNumber || !email) {
      return error(res, 'Thiếu thông tin bắt buộc', 400);
    }

    const parentId = await queries.createParent(userId, trackingId, fullName, phoneNumber, email, address);

    //  Đồng bộ sang service khác
    await syncParentToService({ parentId, userId, trackingId, fullName, phoneNumber, email, address });

    success(res, { parentId }, 'Tạo phụ huynh thành công', 201);
  } catch (err) {
    console.error('Error creating parent:', err);
    error(res, err.message);
  }
};

// Lấy tất cả phụ huynh
const getAllParents = async (req, res) => {
  try {
    const parents = await queries.getAllParents();
    success(res, parents, 'Lấy danh sách phụ huynh thành công');
  } catch (err) {
    console.error('Error getting all parents:', err);
    error(res, err.message);
  }
};

// Lấy phụ huynh theo ParentID
const getParentById = async (req, res) => {
  try {
    const parent = await queries.getParentById(req.params.id);
    if (!parent) return error(res, 'Không tìm thấy phụ huynh', 404);
    success(res, parent);
  } catch (err) {
    console.error('Error getting parent:', err);
    error(res, err.message);
  }
};

// Lấy phụ huynh theo UserID
const getParentByUserId = async (req, res) => {
  try {
    const parent = await queries.getParentByUserId(req.params.userId);
    if (!parent) return error(res, 'Không tìm thấy phụ huynh', 404);
    success(res, parent);
  } catch (err) {
    console.error('Error getting parent by userId:', err);
    error(res, err.message);
  }
};

// Cập nhật phụ huynh
const updateParent = async (req, res) => {
  try {
    const { trackingId, fullName, phoneNumber, email, address } = req.body;
    const parentId = req.params.id;

    await queries.updateParent(parentId, trackingId, fullName, phoneNumber, email, address);

    //  Đồng bộ sang service khác
    await syncParentToService({ parentId, trackingId, fullName, phoneNumber, email, address });

    success(res, null, 'Cập nhật phụ huynh thành công');
  } catch (err) {
    console.error('Error updating parent:', err);
    error(res, err.message);
  }
};

// Xóa phụ huynh
const deleteParent = async (req, res) => {
  try {
    const parentId = req.params.id;

    await queries.deleteParent(parentId);

    //  Đồng bộ xóa sang service khác
    await deleteParentFromService(parentId);

    success(res, null, 'Xóa phụ huynh thành công');
  } catch (err) {
    console.error('Error deleting parent:', err);
    error(res, err.message);
  }
};

module.exports = {
  createParent,
  getAllParents,
  getParentById,
  getParentByUserId,
  updateParent,
  deleteParent
};