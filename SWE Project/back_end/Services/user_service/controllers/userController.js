const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const queries = require('../db/userQueries');
const { success, error } = require('../utils/response');

const getAllUsers = async (req, res) => {
  try {
    const users = await queries.getAllUsers();
    success(res, users, 'Lấy danh sách người dùng thành công');
  } catch (err) {
    console.error(err);
    error(res);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
      return error(res, 'UserID không hợp lệ', 400);
    }
    const user = await queries.getUserById(id);
    if (!user) return error(res, 'Không tìm thấy người dùng', 404);
    success(res, user);
  } catch (err) {
    error(res);
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, roleId, fullName, phoneNumber, email } = req.body;

    // Kiểm tra username trùng
    const existing = await queries.getUserByUsername(username);
    if (existing) return error(res, 'Tên đăng nhập đã tồn tại', 400);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const userId = await queries.createUser(username, hashedPassword, roleId || null);

    // Tạo profile admin nếu có
    if (fullName || phoneNumber || email) {
      await queries.createAdminProfile(userId, fullName, phoneNumber, email);
    }

    success(res, { UserID: userId, UserName: username }, 'Tạo người dùng thành công', 201);
  } catch (err) {
    console.error(err);
    error(res);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, roleId, fullName, phoneNumber, email } = req.body;

    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
      return error(res, 'UserID không hợp lệ', 400);
    }

    const user = await queries.getUserById(id);
    if (!user) return error(res, 'Không tìm thấy người dùng', 404);

    if (username && username !== user.UserName) {
      const existing = await queries.getUserByUsername(username);
      if (existing) return error(res, 'Tên đăng nhập đã tồn tại', 400);
    }

    // Cập nhật user
    await queries.updateUser(
      id,
      username || user.UserName,
      roleId !== undefined ? roleId : user.RoleID
    );

    // Cập nhật admin profile nếu có
    if (fullName || phoneNumber || email || Object.keys(req.body).some(k => ['fullName', 'phoneNumber', 'email'].includes(k))) {
      await queries.updateAdminProfile(
        id,
        fullName || user.FullName || '',
        phoneNumber || user.PhoneNumber || '',
        email || user.Email || ''
      );
    }

    success(res, null, 'Cập nhật thành công');
  } catch (err) {
    console.error(err);
    error(res);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
      return error(res, 'UserID không hợp lệ', 400);
    }

    const user = await queries.getUserById(id);
    if (!user) return error(res, 'Không tìm thấy người dùng', 404);

    await queries.deleteUser(id);
    success(res, null, 'Xóa thành công');
  } catch (err) {
    error(res);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};