const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const queries = require('../db/userQueries');
const { success, error } = require('../utils/response');

// Đồng bộ tạo/cập nhật user sang auth_service
async function syncToAuthService({ userID, username, password, roleID }) {
  try {
    await axios.post('http://localhost:3019/api/auth/sync', {
      userID,
      username,
      password,
      roleID
    });
    console.log(`✅ Đồng bộ user ${username} sang auth_service thành công`);
  } catch (err) {
    console.error(`❌ Lỗi đồng bộ user ${username}:`, err.message);
  }
}

// Đồng bộ xóa user sang auth_service
async function deleteFromAuthService(userID) {
  try {
    await axios.delete(`http://localhost:3019/api/auth/sync/${userID}`);
    console.log(`🗑️ Đã đồng bộ xóa user ${userID} sang auth_service`);
  } catch (err) {
    console.error(`❌ Lỗi xóa user ${userID} ở auth_service:`, err.message);
  }
}

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

    const existing = await queries.getUserByUsername(username);
    if (existing) return error(res, 'Tên đăng nhập đã tồn tại', 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await queries.createUser(username, hashedPassword, roleId || null);

    if (fullName || phoneNumber || email) {
      await queries.createAdminProfile(userId, fullName, phoneNumber, email);
    }

    await syncToAuthService({
      userID: userId,
      username,
      password, // gửi mật khẩu gốc để auth_service tự hash nếu cần
      roleID: roleId || null
    });

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

    await queries.updateUser(
      id,
      username || user.UserName,
      roleId !== undefined ? roleId : user.RoleID
    );

    if (fullName || phoneNumber || email || Object.keys(req.body).some(k => ['fullName', 'phoneNumber', 'email'].includes(k))) {
      await queries.updateAdminProfile(
        id,
        fullName || user.FullName || '',
        phoneNumber || user.PhoneNumber || '',
        email || user.Email || ''
      );
    }

    await syncToAuthService({
      userID: id,
      username: username || user.UserName,
      password: user.Password, // giữ nguyên mật khẩu đã mã hóa
      roleID: roleId !== undefined ? roleId : user.RoleID
    });

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
    await deleteFromAuthService(id);

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