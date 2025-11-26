const express = require('express');
const router = express.Router();
const db = require('./dbUsers');
const bcrypt = require('bcrypt')
// 1. Lấy toàn bộ users
router.get("/users", (req, res) => {
  const sql = `SELECT * FROM users`; // Không trả password
  console.log('lies')
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// 2. Lấy user theo ID
router.get("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT UserID, UserName, RoleID FROM users WHERE UserID = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json(results[0]);
  });
});

// 3. Thêm user
router.post("/user", async (req, res) => {
  const { username, password, roleID } = req.body;

  if ( !username || !password || !roleID)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users ( UserName, Password, RoleID) VALUES ( ?, ?, ?)`;
    db.query(sql, [ username, password, roleID], (err) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.status(201).json({ message: "User created" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Cập nhật user
router.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { username, roleID, password } = req.body;
  console.log('kav: ',req.body)
  if (!username && !password && !roleID)
    return res.status(400).json({ error: "Nothing to update" });

  try {
    let updateFields = [];
    let updateValues = [];

    if (username) {
      updateFields.push("UserName = ?");
      updateValues.push(username);
    }

    if (password) {
      // const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("Password = ?");
      updateValues.push(password);
    }

    if (roleID) {
      updateFields.push("RoleID = ?");
      updateValues.push(roleID);
    }

    updateValues.push(id);

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE UserID = ?`;
    console.log('----')
    db.query(sql, updateValues, (err, result) => {
      if (err) return res.status(500).json({ error: "Update failed" });

      if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

      res.json({ message: "User updated" });
    });
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Xóa user
router.delete("/user/:id", (req, res) => {
  const { id } = req.params;
  console.log('hiaf')
  const sql = `DELETE FROM users WHERE UserID = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete failed" });

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted" });
  });
});
module.exports=router