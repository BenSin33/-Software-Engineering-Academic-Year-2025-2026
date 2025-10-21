const dbUsers = require('./dbUsers');
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

// Hàm kiểm tra RoleID có tồn tại
async function checkRoleExists(roleID) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT RoleID FROM roles WHERE RoleID = ?`;
    dbUsers.query(sql, [roleID], (err, result) => {
      if (err) return reject(err);
      resolve(result.length > 0);
    });
  });
}

// Đăng ký
exports.register = async (req, res) => {
  const { userID, username, password, roleID } = req.body;

  try {
    // Kiểm tra RoleID có tồn tại
    const roleExists = await checkRoleExists(roleID);
    if (!roleExists) {
      await sendLog("auth_service", "register", null, roleID, 400, "Invalid RoleID");
      return res.status(400).json({ error: "Invalid RoleID" });
    }

    // Kiểm tra username đã tồn tại
    const checkUserSql = `SELECT UserName FROM users WHERE UserName = ?`;
    dbUsers.query(checkUserSql, [username], async (err, result) => {
      if (err) {
        await sendLog("auth_service", "register", null, roleID, 500, "Database error");
        return res.status(500).json({ error: "Database error" });
      }
      if (result.length > 0) {
        await sendLog("auth_service", "register", null, roleID, 400, "Username already exists");
        return res.status(400).json({ error: "Username already exists" });
      }

      // Băm mật khẩu
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Chèn dữ liệu vào bảng users
      const sql = `INSERT INTO users (UserID, UserName, Password, RoleID) VALUES (?, ?, ?, ?)`;
      dbUsers.query(sql, [userID, username, hashedPassword, roleID], async (err, result) => {
        if (err) {
          await sendLog("auth_service", "register", userID, roleID, 500, "Registration failed");
          return res.status(500).json({ error: "Registration failed" });
        }

        await sendLog("auth_service", "register", userID, roleID, 201, "Registration successful");
        res.status(201).json({ message: "Registration successful", userID });
      });
    });
  } catch (error) {
    await sendLog("auth_service", "register", null, roleID, 500, "Server error during registration");
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT u.*, r.RoleName 
               FROM users u 
               JOIN roles r ON u.RoleID = r.RoleID 
               WHERE u.UserName = ?`;

  dbUsers.query(sql, [username], async (err, result) => {
    if (err) {
      await sendLog("auth_service", "login", null, "unknown", 500, "Database error");
      return res.status(500).json({ error: "Server error" });
    }

    if (!result || result.length === 0) {
      await sendLog("auth_service", "login", null, "unknown", 401, "Invalid credentials");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result[0];
    let storedPassword = user.Password;

    try {
      // Nếu mật khẩu chưa mã hóa, mã hóa lại và cập nhật
      if (!storedPassword.startsWith("$2b$")) {
        const hashed = await bcrypt.hash(storedPassword, 10);
        const updateSql = `UPDATE users SET Password = ? WHERE UserID = ?`;
        dbUsers.query(updateSql, [hashed, user.UserID], (updateErr) => {
          if (updateErr) {
            console.error(`❌ Không thể cập nhật mật khẩu cho ${user.UserID}:`, updateErr);
          } else {
            console.log(`✅ Đã mã hóa mật khẩu cho ${user.UserID}`);
          }
        });
        storedPassword = hashed;
      }

      const isMatch = await bcrypt.compare(password, storedPassword);

      if (!isMatch) {
        await sendLog("auth_service", "login", user.UserID, user.RoleID, 401, "Wrong password");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await sendLog("auth_service", "login", user.UserID, user.RoleID, 200, "Login successful");
      return res.json({ userID: user.UserID, roleID: user.RoleID, roleName: user.RoleName });

    } catch (error) {
      console.error("❌ Lỗi xử lý đăng nhập:", error);
      await sendLog("auth_service", "login", user.UserID, user.RoleID, 500, "Login error");
      return res.status(500).json({ error: "Login error" });
    }
  });
};