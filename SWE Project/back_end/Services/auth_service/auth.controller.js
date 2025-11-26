const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const db = require('./dbUsers');
const bcrypt = require('bcrypt');

// Helper: Query DB dạng Promise
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// ============================
//       LOGIN
// ============================
router.post("/login", authService.login);

// ============================
//   SYNC CREATE/UPDATE USER
// ============================
router.post("/sync", async (req, res) => {
  const { userID, username, password, roleID } = req.body;

  if (!userID || !username || !password || !roleID) {
    return res.status(400).json({ error: "Thiếu dữ liệu để đồng bộ user" });
  }

  try {
    // Nếu đã hash rồi thì giữ nguyên
    const hashedPassword = password.startsWith("$2b$")
      ? password
      : await bcrypt.hash(password, 10);

    // Kiểm tra user đã tồn tại chưa
    const checkSql = `SELECT * FROM users WHERE UserID = ?`;
    const existing = await query(checkSql, [userID]);

    if (existing.length > 0) {
      // UPDATE
      const updateSql = `UPDATE users SET UserName = ?, Password = ?, RoleID = ? WHERE UserID = ?`;
      await query(updateSql, [username, hashedPassword, roleID, userID]);

      console.log(`🔄 Đồng bộ cập nhật User: ${userID} sang auth_service`);

      return res.json({
        message: "User updated in auth_service",
        synced: true,
        type: "update",
      });
    } else {
      // INSERT
      const insertSql = `INSERT INTO users (UserID, UserName, Password, RoleID) VALUES (?, ?, ?, ?)`;
      await query(insertSql, [userID, username, hashedPassword, roleID]);

      console.log(`🆕 Đồng bộ tạo mới User: ${userID} sang auth_service`);

      return res.status(201).json({
        message: "User synced to auth_service",
        synced: true,
        type: "create",
      });
    }
  } catch (err) {
    console.error("❌ Lỗi đồng bộ user:", err.message);
    return res.status(500).json({ error: "Sync error", detail: err.message });
  }
});

// ============================
//        SYNC DELETE USER
// ============================
router.delete("/sync/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM users WHERE UserID = ?`;
    await query(sql, [id]);

    console.log(`🗑️ Đồng bộ xóa User ${id} khỏi auth_service`);

    return res.json({ message: "User đã được xóa khỏi auth_service" });
  } catch (err) {
    console.error("❌ Lỗi xóa user:", err.message);
    return res.status(500).json({ error: "Xóa thất bại ở auth_service" });
  }
});

module.exports = router;

