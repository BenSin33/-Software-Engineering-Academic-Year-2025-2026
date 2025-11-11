require("dotenv").config(); // Load biến môi trường từ file .env

const dbUsers = require('./dbUsers'); // Kết nối tới database người dùng
const bcrypt = require("bcrypt"); // Thư viện mã hóa mật khẩu
const axios = require("axios"); // Dùng để gửi HTTP request tới log_service
const jwt = require("jsonwebtoken"); // Thư viện tạo và xác thực JWT

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key"; // Lấy JWT_SECRET từ biến môi trường hoặc dùng giá trị mặc định

// Hàm gửi log sang log_service
async function sendLog(serviceName, action, userID, role, statusCode, message) {
  try {
    await axios.post("http://localhost:3001/log", {
      serviceName, // Tên service đang ghi log
      action, // Hành động đang thực hiện (vd: login)
      userID, // ID người dùng
      role, // Vai trò người dùng
      statusCode, // Mã trạng thái HTTP
      message, // Thông điệp mô tả
    });
  } catch (error) {
    console.error("Ghi log thất bại:", error.message); // In lỗi nếu gửi log thất bại
  }
}

// Hàm kiểm tra RoleID có tồn tại trong bảng roles
async function checkRoleExists(roleID) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT RoleID FROM roles WHERE RoleID = ?`; // Truy vấn kiểm tra RoleID
    dbUsers.query(sql, [roleID], (err, result) => {
      if (err) return reject(err); // Nếu lỗi thì reject
      resolve(result.length > 0); // Trả về true nếu có kết quả
    });
  });
}

// Hàm xử lý đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body; // Lấy thông tin đăng nhập từ request

  const sql = `SELECT u.*, r.RoleName 
               FROM users u 
               JOIN roles r ON u.RoleID = r.RoleID 
               WHERE u.UserName = ?`; // Truy vấn lấy thông tin người dùng và vai trò

  dbUsers.query(sql, [username], async (err, result) => {
    if (err) {
      await sendLog("auth_service", "login", null, "unknown", 500, "Database error"); // Ghi log lỗi DB
      return res.status(500).json({ error: "Server error" }); // Trả về lỗi server
    }

    if (!result || result.length === 0) {
      await sendLog("auth_service", "login", null, "unknown", 401, "Invalid credentials"); // Ghi log đăng nhập sai
      return res.status(401).json({ error: "Invalid credentials" }); // Trả về lỗi xác thực
    }

    const user = result[0]; // Lấy thông tin người dùng đầu tiên
    let storedPassword = user.Password; // Lấy mật khẩu đã lưu

    try {
      // Nếu mật khẩu chưa được mã hóa bằng bcrypt, tiến hành mã hóa và cập nhật
      if (!storedPassword.startsWith("$2b$")) {
        const hashed = await bcrypt.hash(storedPassword, 10); // Mã hóa mật khẩu
        const updateSql = `UPDATE users SET Password = ? WHERE UserID = ?`; // Câu lệnh cập nhật mật khẩu
        dbUsers.query(updateSql, [hashed, user.UserID], (updateErr) => {
          if (updateErr) {
            console.error(` Không thể cập nhật mật khẩu cho ${user.UserID}:`, updateErr); // In lỗi nếu cập nhật thất bại
          } else {
            console.log(` Đã mã hóa mật khẩu cho ${user.UserID}`); // In thông báo nếu cập nhật thành công
          }
        });
        storedPassword = hashed; // Gán lại mật khẩu đã mã hóa
      }

      const isMatch = await bcrypt.compare(password, storedPassword); // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa

      if (!isMatch) {
        await sendLog("auth_service", "login", user.UserID, user.RoleID, 401, "Wrong password"); // Ghi log sai mật khẩu
        return res.status(401).json({ error: "Invalid credentials" }); // Trả về lỗi xác thực
      }

      // Tạo JWT sau khi xác thực thành công
      const payload = {
        userID: user.UserID, // ID người dùng
        roleID: user.RoleID, // Vai trò người dùng
        roleName: user.RoleName, // Tên vai trò
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }); // Tạo token có thời hạn 1 giờ

      await sendLog("auth_service", "login", user.UserID, user.RoleID, 200, "Login successful"); // Ghi log đăng nhập thành công
      return res.json({ token, userID: user.UserID, roleID: user.RoleID, roleName: user.RoleName }); // Trả về token và thông tin người dùng

    } catch (error) {
      console.error(" Lỗi xử lý đăng nhập:", error); // In lỗi nếu có exception
      await sendLog("auth_service", "login", user.UserID, user.RoleID, 500, "Login error"); // Ghi log lỗi đăng nhập
      return res.status(500).json({ error: "Login error" }); // Trả về lỗi server
    }
  });
};