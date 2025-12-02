// Import kết nối cơ sở dữ liệu
const pool = require('./pool');
const { v4: uuidv4 } = require('uuid');

// ============================
// Helper: Generate sequential DriverID (Dxxx)
// ============================

async function findDriversWithoutRoute() {
  try {
    const [drivers] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, BusID, RouteID, CreatedAt
FROM drivers
WHERE RouteID IS NULL OR RouteID IN ('null', 'N/A', 'Null')
ORDER BY CreatedAt DESC;`
    );
    return drivers;
  } catch (error) {
    console.error('Error in findDriversWithoutRoute:', error);
    throw error;
  }
}

const generateNextDriverId = async (connection = null) => {
  const db = connection || pool;
  try {
    const [rows] = await db.query(
      "SELECT DriverID FROM drivers WHERE DriverID LIKE 'D%' ORDER BY LENGTH(DriverID) DESC, DriverID DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return 'D001';
    }

    const lastId = rows[0].DriverID;
    const numericPart = parseInt(lastId.substring(1));
    const nextId = numericPart + 1;

    return `D${nextId.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating DriverID:', error);
    throw error;
  }
};

// ============================
// CREATE DRIVER (Sequential ID)
// ============================
const createDriverSequential = async (userId, fullName, phoneNumber, email, status = 'Active', connection = null) => {
  const db = connection || pool;
  const driverId = await generateNextDriverId(connection);

  try {
    await db.query(
      `INSERT INTO drivers 
       (DriverID, UserID, FullName, PhoneNumber, Email, Status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [driverId, userId, fullName, phoneNumber, email, status || 'Active']
    );
    return driverId;
  } catch (err) {
    console.error('Lỗi khi tạo tài xế (Sequential):', err);
    throw new Error('Không thể tạo tài xế mới: ' + err.message);
  }
};

// ============================
// CREATE DRIVER (UUID)
// ============================
const createDriverUUID = async (userId, fullName, phoneNumber, email, status = 'active') => {
  const driverId = uuidv4();
  try {
    await pool.query(
      `INSERT INTO drivers 
       (DriverID, UserID, FullName, PhoneNumber, Email, Status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [driverId, userId, fullName, phoneNumber, email, status || 'active']
    );
    return driverId;
  } catch (err) {
    console.error('Lỗi khi tạo tài xế (UUID):', err);
    throw new Error('Không thể tạo tài xế mới: ' + err.message);
  }
};

// ============================
// GET ALL DRIVERS
// ============================
const getAllDrivers = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, BusID, RouteID, CreatedAt 
       FROM drivers 
       ORDER BY CreatedAt DESC`
    );
    return rows;
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tài xế:', err);
    throw new Error('Không thể lấy danh sách tài xế: ' + err.message);
  }
};

// ============================
// GET DRIVER BY ID
// ============================
const getDriverById = async (driverId) => {
  try {
    const [rows] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, CreatedAt 
       FROM drivers 
       WHERE DriverID = ?`,
      [driverId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('Lỗi khi lấy tài xế theo ID:', err);
    throw new Error('Không thể lấy thông tin tài xế: ' + err.message);
  }
};

// ============================
// GET DRIVER BY USER ID
// ============================
const getDriverByUserId = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT DriverID, UserID, FullName, PhoneNumber, Email, Status, CreatedAt 
       FROM drivers 
       WHERE UserID = ?`,
      [userId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('Lỗi khi lấy tài xế theo UserID:', err);
    throw new Error('Không thể lấy thông tin tài xế theo UserID: ' + err.message);
  }
};

// ============================
// UPDATE DRIVER
// ============================
// const updateDriver = async (driverId, fullName, phoneNumber, email, status) => {
//   try {
//     const [result] = await pool.query(
//       `UPDATE drivers 
//        SET FullName = ?, PhoneNumber = ?, Email = ?, Status = ?, UpdatedAt = NOW()
//        WHERE DriverID = ?`,
//       [fullName, phoneNumber, email, status, driverId]
//     );

//     if (result.affectedRows === 0) {
//       throw new Error('Không tìm thấy tài xế để cập nhật');
//     }
//   } catch (err) {
//     console.error('Lỗi khi cập nhật tài xế:', err);
//     throw new Error('Cập nhật tài xế thất bại: ' + err.message);
//   }
// };
const updateDriver = async (
  driverId,
  fullName,
  phoneNumber,
  email,
  status,
  routeID,
  busID
) => {
  try {
    const fields = [];
    const values = [];
    // Chỉ push field nếu có giá trị
    if (fullName !== undefined && fullName !== null) {
      fields.push("FullName = ?");
      values.push(fullName);
    }
    if (phoneNumber !== undefined && phoneNumber !== null) {
      fields.push("PhoneNumber = ?");
      values.push(phoneNumber);
    }
    if (email !== undefined && email !== null) {
      fields.push("Email = ?");
      values.push(email);
    }
    if (status !== undefined && status !== null) {
      fields.push("Status = ?");
      values.push(status);
    }
    if (routeID !== undefined && routeID !== null) {
      fields.push("RouteID = ?");
      values.push(routeID);
    }
    if (busID !== undefined && busID !== null) {
      fields.push("BusID = ?");
      values.push(busID);
    }

    // Nếu không có field nào để update
    if (fields.length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    // Cập nhật UpdatedAt
    fields.push("UpdatedAt = NOW()");

    const sql = `
      UPDATE drivers 
      SET ${fields.join(", ")}
      WHERE DriverID = ?
    `;

    values.push(driverId); // Cuối cùng là driverID cho câu WHERE

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy tài xế để cập nhật");
    }

  } catch (err) {
    console.error("Lỗi khi cập nhật tài xế:", err);
    throw new Error("Cập nhật tài xế thất bại: " + err.message);
  }
};

// ============================
// DELETE DRIVER
// ============================
const deleteDriver = async (driverId) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM drivers WHERE DriverID = ?',
      [driverId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy tài xế để xóa');
    }
  } catch (err) {
    console.error('Lỗi khi xóa tài xế:', err);
    throw new Error('Xóa tài xế thất bại: ' + err.message);
  }
};

// ============================
// DRIVER STATS
// ============================
const getDriverStats = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN Status = 'Inactive' THEN 1 ELSE 0 END) as rest
       FROM drivers`
    );
    return rows[0] || { total: 0, active: 0, rest: 0 };
  } catch (err) {
    console.error('Lỗi khi lấy thống kê tài xế:', err);
    throw new Error('Không thể lấy thống kê tài xế: ' + err.message);
  }
};

module.exports = {
  createDriver: createDriverSequential,
  createDriverSequential,
  createDriverUUID,
  getAllDrivers,
  getDriverById,
  getDriverByUserId,
  updateDriver,
  deleteDriver,
  getDriverStats,
  findDriversWithoutRoute
};
