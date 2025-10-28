const { v4: uuidv4 } = require('uuid');
const pool = require('./pool');

const createDriver = async (userId, fullName, phoneNumber, email, status) => {
  const driverId = uuidv4();
  await pool.query(
    'INSERT INTO drivers (DriverID, UserID, FullName, PhoneNumber, Email, Status) VALUES (?, ?, ?, ?, ?, ?)',
    [driverId, userId, fullName, phoneNumber, email, status]
  );
  return driverId;
};

const getDriverById = async (driverId) => {
  const [rows] = await pool.query('SELECT * FROM drivers WHERE DriverID = ?', [driverId]);
  return rows[0];
};

const updateDriver = async (driverId, fullName, phoneNumber, email, status) => {
  await pool.query(
    'UPDATE drivers SET FullName = ?, PhoneNumber = ?, Email = ?, Status = ? WHERE DriverID = ?',
    [fullName, phoneNumber, email, status, driverId]
  );
};

const deleteDriver = async (driverId) => {
  await pool.query('DELETE FROM drivers WHERE DriverID = ?', [driverId]);
};

module.exports = { createDriver, getDriverById, updateDriver, deleteDriver };