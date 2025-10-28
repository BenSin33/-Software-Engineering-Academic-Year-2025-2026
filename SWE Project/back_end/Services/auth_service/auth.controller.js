const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const db = require('./dbUsers');
const bcrypt = require('bcrypt');

// Đăng nhập
router.post("/login", authService.login);

// Đồng bộ tạo/cập nhật user từ user_service
router.post("/sync", async (req, res) => {
  const { userID, username, password, roleID } = req.body;

  try {
    const hashedPassword = password.startsWith('$2b$')
      ? password
      : await bcrypt.hash(password, 10);

    const checkSql = `SELECT * FROM users WHERE UserID = ?`;
    db.query(checkSql, [userID], (err, result) => {
      if (err) return res.status(500).json({ error: 'DB error' });

      if (result.length > 0) {
        const updateSql = `UPDATE users SET UserName = ?, Password = ?, RoleID = ? WHERE UserID = ?`;
        db.query(updateSql, [username, hashedPassword, roleID, userID], (err) => {
          if (err) return res.status(500).json({ error: 'Update failed' });
          res.json({ message: 'User updated in auth_service' });
        });
      } else {
        const insertSql = `INSERT INTO users (UserID, UserName, Password, RoleID) VALUES (?, ?, ?, ?)`;
        db.query(insertSql, [userID, username, hashedPassword, roleID], (err) => {
          if (err) return res.status(500).json({ error: 'Insert failed' });
          res.status(201).json({ message: 'User synced to auth_service' });
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Sync error', detail: err.message });
  }
});

// Đồng bộ xóa user từ user_service
router.delete("/sync/:id", async (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM users WHERE UserID = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Xóa thất bại ở auth_service' });
    res.json({ message: 'User đã được xóa khỏi auth_service' });
  });
});

module.exports = router;