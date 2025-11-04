const { v4: uuidv4 } = require('uuid');
const pool = require('./pool');

// Tạo parent mới
const createParent = async (userId, trackingId, fullName, phoneNumber, email, address) => {
  const parentId = uuidv4();
  await pool.query(
    'INSERT INTO parents (ParentID, UserID, TrackingID, FullName, PhoneNumber, Email, Address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [parentId, userId, trackingId, fullName, phoneNumber, email, address]
  );
  return parentId;
};

// Lấy parent theo ParentID
const getParentById = async (parentId) => {
  const [rows] = await pool.query('SELECT * FROM parents WHERE ParentID = ?', [parentId]);
  return rows[0];
};

// 🔧 THÊM MỚI: Lấy parent theo UserID
const getParentByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM parents WHERE UserID = ?', [userId]);
  return rows[0];
};

// Lấy tất cả parents
const getAllParents = async () => {
  const [rows] = await pool.query('SELECT * FROM parents ORDER BY CreatedAt DESC');
  return rows;
};

// Cập nhật parent
const updateParent = async (parentId, trackingId, fullName, phoneNumber, email, address) => {
  await pool.query(
    'UPDATE parents SET TrackingID = ?, FullName = ?, PhoneNumber = ?, Email = ?, Address = ? WHERE ParentID = ?',
    [trackingId, fullName, phoneNumber, email, address, parentId]
  );
};

// Xóa parent
const deleteParent = async (parentId) => {
  await pool.query('DELETE FROM parents WHERE ParentID = ?', [parentId]);
};

module.exports = { 
  createParent, 
  getParentById, 
  getParentByUserId, // 🔧 Export thêm function mới
  getAllParents,
  updateParent, 
  deleteParent 
};