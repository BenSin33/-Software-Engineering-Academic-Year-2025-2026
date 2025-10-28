const { v4: uuidv4 } = require('uuid');
const pool = require('./pool');

const createParent = async (userId, trackingId, fullName, phoneNumber, email, address) => {
  const parentId = uuidv4();
  await pool.query(
    'INSERT INTO parents (ParentID, UserID, TrackingID, FullName, PhoneNumber, Email, Address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [parentId, userId, trackingId, fullName, phoneNumber, email, address]
  );
  return parentId;
};

const getParentById = async (parentId) => {
  const [rows] = await pool.query('SELECT * FROM parents WHERE ParentID = ?', [parentId]);
  return rows[0];
};

const updateParent = async (parentId, trackingId, fullName, phoneNumber, email, address) => {
  await pool.query(
    'UPDATE parents SET TrackingID = ?, FullName = ?, PhoneNumber = ?, Email = ?, Address = ? WHERE ParentID = ?',
    [trackingId, fullName, phoneNumber, email, address, parentId]
  );
};

const deleteParent = async (parentId) => {
  await pool.query('DELETE FROM parents WHERE ParentID = ?', [parentId]);
};

module.exports = { createParent, getParentById, updateParent, deleteParent };