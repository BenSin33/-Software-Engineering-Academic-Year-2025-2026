const db = require("dbUsers");
const bcrypt = require("bcrypt");
const axios = require("axios");

// Hàm gửi log sang log_service
async function sendLog(serviceName, action, userID, role, statusCode, message) {
  try {
    await axios.post("http://localhost:3001/log", {
      serviceName,
      action,
      userID,
      role,
      statusCode,
      message,
    });
  } catch (error) {
    console.error("Ghi log thất bại:", error.message);
  }
}

// Đăng ký
exports.register = async (req, res) => {
  const { username, password, roleID } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `INSERT INTO users (UserName, Password, RoleID) VALUES (?, ?, ?)`;
    db.query(sql, [username, hashedPassword, roleID], async (err, result) => {
      if (err) {
        await sendLog("auth_service", "register", null, roleID, 500, "Registration failed");
        return res.status(500).json({ error: "Registration failed" });
      }

      await sendLog("auth_service", "register", result.insertId, roleID, 201, "Registration successful");
      res.json({ message: "Registration successful" });
    });
  } catch (error) {
    await sendLog("auth_service", "register", null, roleID, 500, "Server error during registration");
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Đăng nhập
exports.login = (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM users WHERE UserName = ?`;
  db.query(sql, [username], async (err, result) => {
    if (err) {
      await sendLog("auth_service", "login", null, "unknown", 500, "Database error");
      return res.status(500).json({ error: "Server error" });
    }

    if (result.length === 0) {
      await sendLog("auth_service", "login", null, "unknown", 401, "Invalid credentials");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      await sendLog("auth_service", "login", user.UserID, user.RoleID, 401, "Wrong password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await sendLog("auth_service", "login", user.UserID, user.RoleID, 200, "Login successful");
    res.json({ userID: user.UserID, role: user.RoleID });
  });
};

