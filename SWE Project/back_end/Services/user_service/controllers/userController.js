const queries = require('../db/userQueries');
const { success, error } = require('../utils/response');
const { 
  syncUserToService, 
  deleteUserFromService,
  syncUserToAuth,
  deleteUserFromAuth
} = require('../utils/syncUtils');

// =============================================
// TẠO USER
// =============================================
const createUser = async (req, res) => {
  try {
    const { username, password, roleId, fullName, phoneNumber, email } = req.body;

    if (!username || !password) {
      return error(res, 'Thiếu thông tin bắt buộc (username, password)', 400);
    }

    const existing = await queries.getUserByUsername(username);
    if (existing) return error(res, 'Tên đăng nhập đã tồn tại', 400);

    // Lưu plain text password
    const userId = await queries.createUser(username, password, roleId || null);
    console.log('userID: ',userId)
    if (fullName || phoneNumber || email) {
      await queries.createAdminProfile(userId, fullName, phoneNumber, email);
    }

    // Đồng bộ sang service chính
    await syncUserToService({ userId, username, roleId, fullName, phoneNumber, email });

    // Đồng bộ sang AuthService (gửi plain text password)
    await syncUserToAuth({ userID: userId, username, password, roleID: roleId });

    success(res, { UserID: userId, UserName: username }, 'Tạo người dùng thành công', 201);
  } catch (err) {
    console.error('❌ Error creating user:', err);
    error(res, err.message);
  }
};

// =============================================
// GET ALL
// =============================================
const getAllUsers = async (req, res) => {
  try {
    const users = await queries.getAllUsers();
    success(res, users, 'Lấy danh sách người dùng thành công');
  } catch (err) {
    console.error('Error getting all users:', err);
    error(res, err.message);
  }
};

// =============================================
// GET BY ID
// =============================================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await queries.getUserById(id);
    if (!user) return error(res, 'Không tìm thấy người dùng', 404);
    success(res, user);
  } catch (err) {
    console.error('Error getting user:', err);
    error(res, err.message);
  }
};

// =============================================
// UPDATE
// =============================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, roleId,RoleID, fullName, phoneNumber, email, password,Password } = req.body;
    console.log(req.body)
    const user = await queries.getUserById(id);
    
    if (!user) return error(res, 'Không tìm thấy người dùng', 404);

    if (username && username !== user.UserName) {
      const existing = await queries.getUserByUsername(username);
      if (existing) return error(res, 'Tên đăng nhập đã tồn tại', 400);
    }

    // Nếu có password mới thì lưu plain text
await queries.updateUser(id, username || user.UserName, roleId || RoleID, password || user.Password || Password);

    if (fullName || phoneNumber || email) {
      await queries.updateAdminProfile(id, fullName, phoneNumber, email);
    }

    // Đồng bộ sang service chính
    // await syncUserToService({ userId: id, username: username || user.UserName, roleId, fullName, phoneNumber, email });

    // Đồng bộ sang AuthService (gửi plain text password)
    await syncUserToAuth({ userID: id, username: username || user.UserName, password: password || user.Password || Password, roleID: roleId || user.RoleID || RoleID });

    success(res, null, 'Cập nhật người dùng thành công');
  } catch (err) {
    console.error('Error updating user:', err);
    error(res, err.message);
  }
};

// =============================================
// DELETE
// =============================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await queries.getUserById(id);
    if (!user) return error(res, 'Không tìm thấy người dùng', 404);

    await queries.deleteUser(id);

    // Đồng bộ xóa sang service chính
    await deleteUserFromService(id);

    // Đồng bộ xóa sang AuthService
    await deleteUserFromAuth(user.UserID);

    success(res, null, 'Xóa người dùng thành công');
  } catch (err) {
    console.error('Error deleting user:', err);
    error(res, err.message);
  }
};

// ========================================================
// ⭐⭐⭐ THÊM 2 HÀM ĐỂ NHẬN ĐỒNG BỘ TỪ SERVICE KHÁC ⭐⭐⭐
// ========================================================

// SYNC CREATE / UPDATE
const syncUser = async (req, res) => {
  try {
    const { userId, username, roleId, fullName, phoneNumber, email, password } = req.body;

    const existing = await queries.getUserById(userId);

    if (existing) {
      await queries.updateUser(userId, username, roleId, password || existing.Password);
      await queries.updateAdminProfile(userId, fullName, phoneNumber, email);
      console.log(`🔄 [SYNC] Updated user ${userId}`);
      return success(res, null, "User updated via sync");
    }

    await queries.insertUserFromSync(userId, username, roleId, fullName, phoneNumber, email, password);
    console.log(`🆕 [SYNC] Inserted user ${userId}`);
    return success(res, null, "User created via sync");

  } catch (err) {
    console.error("❌ Sync user error:", err.message);
    return error(res, err.message);
  }
};

// SYNC DELETE
const syncDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await queries.deleteUser(id);
    console.log(`🗑️ [SYNC] Deleted user ${id}`);
    return success(res, null, "User deleted via sync");
  } catch (err) {
    console.error("❌ Sync delete user error:", err.message);
    return error(res, err.message);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  syncUser,
syncDeleteUser
};