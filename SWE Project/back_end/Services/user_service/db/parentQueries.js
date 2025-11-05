const { v4: uuidv4 } = require('uuid');
const pool = require('./pool');

// Tạo parent mới trong cơ sở dữ liệu
const createParent = async (userId, trackingId, fullName, phoneNumber, email, address) => {
  const parentId = uuidv4(); // Tạo mã định danh duy nhất cho parent
  try {
    await pool.query(
      'INSERT INTO parents (ParentID, UserID, TrackingID, FullName, PhoneNumber, Email, Address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [parentId, userId, trackingId, fullName, phoneNumber, email, address]
    );
    return parentId; // Trả về mã ParentID vừa tạo
  } catch (error) {
    console.error('Error creating parent:', error); // Ghi log lỗi nếu có
    throw error; // Ném lỗi ra ngoài để xử lý tiếp
  }
};

// Lấy thông tin parent theo ParentID
const getParentById = async (parentId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parents WHERE ParentID = ?', [parentId]);
    return rows[0]; // Trả về dòng đầu tiên nếu có
  } catch (error) {
    console.error('Error fetching parent by ID:', error);
    throw error;
  }
};

// Lấy thông tin parent theo UserID
const getParentByUserId = async (userId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parents WHERE UserID = ?', [userId]);
    return rows[0]; // Trả về dòng đầu tiên nếu có
  } catch (error) {
    console.error('Error fetching parent by UserID:', error);
    throw error;
  }
};

// Lấy danh sách tất cả các parent, sắp xếp theo thời gian tạo giảm dần
const getAllParents = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM parents ORDER BY CreatedAt DESC');
    return rows; // Trả về toàn bộ danh sách
  } catch (error) {
    console.error('Error fetching all parents:', error);
    throw error;
  }
};

// Cập nhật thông tin parent theo ParentID
const updateParent = async (parentId, trackingId, fullName, phoneNumber, email, address) => {
  try {
    await pool.query(
      'UPDATE parents SET TrackingID = ?, FullName = ?, PhoneNumber = ?, Email = ?, Address = ? WHERE ParentID = ?',
      [trackingId, fullName, phoneNumber, email, address, parentId]
    );
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
};

// Xóa parent khỏi cơ sở dữ liệu theo ParentID
const deleteParent = async (parentId) => {
  try {
    await pool.query('DELETE FROM parents WHERE ParentID = ?', [parentId]);
  } catch (error) {
    console.error('Error deleting parent:', error);
    throw error;
  }
};

// Xuất các hàm để sử dụng ở các module khác
module.exports = { 
  createParent, 
  getParentById, 
  getParentByUserId, 
  getAllParents,
  updateParent, 
  deleteParent 
};