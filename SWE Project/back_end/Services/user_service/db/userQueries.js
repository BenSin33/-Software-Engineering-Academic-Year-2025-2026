const { v4: uuidv4 } = require('uuid');
const pool = require('./pool');

const getAllUsers = async () => {
  const [rows] = await pool.query(`
    SELECT 
      u.UserID, u.UserName, u.RoleID, r.RoleName,
      a.AdminID, a.FullName, a.PhoneNumber, a.Email
    FROM users u
    LEFT JOIN roles r ON u.RoleID = r.RoleID
    LEFT JOIN admin a ON u.UserID = a.UserID
  `);
  return rows;
};

const getUserById = async (userId) => {
  const [rows] = await pool.query(`
    SELECT 
      u.UserID, u.UserName, u.RoleID, r.RoleName,
      a.AdminID, a.FullName, a.PhoneNumber, a.Email
    FROM users u
    LEFT JOIN roles r ON u.RoleID = r.RoleID
    LEFT JOIN admin a ON u.UserID = a.UserID
    WHERE u.UserID = ?
  `, [userId]);
  return rows[0];
};

const getUserByUsername = async (username) => {
  const [rows] = await pool.query(`
    SELECT u.*, a.AdminID, a.FullName, a.PhoneNumber, a.Email
    FROM users u
    LEFT JOIN admin a ON u.UserID = a.UserID
    WHERE u.UserName = ?
  `, [username]);
  return rows[0];
};

const createUser = async (username, password, roleId = null) => {
  const userId = uuidv4();
  await pool.query(
    'INSERT INTO users (UserID, RoleID, UserName, Password) VALUES (?, ?, ?, ?)',
    [userId, roleId, username, password]
  );
  return userId;
};

const createAdminProfile = async (userId, fullName, phoneNumber, email) => {
  const adminId = uuidv4();
  await pool.query(
    'INSERT INTO admin (AdminID, UserID, FullName, PhoneNumber, Email) VALUES (?, ?, ?, ?, ?)',
    [adminId, userId, fullName, phoneNumber, email]
  );
  return adminId;
};

const updateUser = async (userId, username, roleId) => {
  await pool.query(
    'UPDATE users SET UserName = ?, RoleID = ? WHERE UserID = ?',
    [username, roleId, userId]
  );
};

const updateAdminProfile = async (userId, fullName, phoneNumber, email) => {
  await pool.query(
    `INSERT INTO admin (AdminID, UserID, FullName, PhoneNumber, Email) 
     VALUES (?, ?, ?, ?, ?) 
     ON DUPLICATE KEY UPDATE 
       FullName = VALUES(FullName), 
       PhoneNumber = VALUES(PhoneNumber), 
       Email = VALUES(Email)`,
    [uuidv4(), userId, fullName, phoneNumber, email]
  );
};

const deleteUser = async (userId) => {
  // Xóa admin trước
  await pool.query('DELETE FROM admin WHERE UserID = ?', [userId]);
  // Xóa user
  await pool.query('DELETE FROM users WHERE UserID = ?', [userId]);
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  createAdminProfile,
  updateUser,
  updateAdminProfile,
  deleteUser,
};