// bus_service/db/queries/driverQueries.js
const pool = require('../pool');

class DriverQueries {
  // Lấy tất cả tài xế với điều kiện động
  async findAll(filters = {}, pagination = {}) {
    const {
      status,
      search,
      Fullname,
      PhoneNumber,
      Email
    } = filters;

    const { limit = 100, offset = 0 } = pagination;

    let query = 'SELECT * FROM Drivers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM Drivers WHERE 1=1';
    let params = [];
    let countParams = [];

    // Lọc theo trạng thái
    if (status && status !== 'all') {
      query += ' AND Status = ?';
      countQuery += ' AND Status = ?';
      params.push(status);
      countParams.push(status);
    }

    // Tìm kiếm cơ bản
    if (search) {
      query += ' AND (Fullname LIKE ? OR PhoneNumber LIKE ? OR Email LIKE ?)';
      countQuery += ' AND (Fullname LIKE ? OR PhoneNumber LIKE ? OR Email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Bộ lọc nâng cao
    if (Fullname) {
      query += ' AND Fullname LIKE ?';
      countQuery += ' AND Fullname LIKE ?';
      const namePattern = `%${Fullname}%`;
      params.push(namePattern);
      countParams.push(namePattern);
    }

    if (PhoneNumber) {
      query += ' AND PhoneNumber LIKE ?';
      countQuery += ' AND PhoneNumber LIKE ?';
      const phonePattern = `%${PhoneNumber}%`;
      params.push(phonePattern);
      countParams.push(phonePattern);
    }

    if (Email) {
      query += ' AND Email LIKE ?';
      countQuery += ' AND Email LIKE ?';
      const emailPattern = `%${Email}%`;
      params.push(emailPattern);
      countParams.push(emailPattern);
    }

    // Sắp xếp và phân trang
    query += ' ORDER BY DriverID LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [drivers] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);

    return {
      drivers,
      total: countResult[0].total
    };
  }

  // Lấy tài xế theo ID
  async findById(driverId) {
    const [drivers] = await pool.query(
      'SELECT * FROM Drivers WHERE DriverID = ?',
      [driverId]
    );
    return drivers[0];
  }

  // Lấy tài xế theo UserID
  async findByUserId(userId) {
    const [drivers] = await pool.query(
      'SELECT * FROM Drivers WHERE UserID = ?',
      [userId]
    );
    return drivers[0];
  }

  // Lấy tài xế theo email
  async findByEmail(email) {
    const [drivers] = await pool.query(
      'SELECT * FROM Drivers WHERE Email = ?',
      [email]
    );
    return drivers[0];
  }

  // Lấy tài xế theo số điện thoại
  async findByPhoneNumber(phoneNumber) {
    const [drivers] = await pool.query(
      'SELECT * FROM Drivers WHERE PhoneNumber = ?',
      [phoneNumber]
    );
    return drivers[0];
  }

  // Kiểm tra tồn tại theo UserID
  async existsByUserId(userId) {
    const [result] = await pool.query(
      'SELECT DriverID FROM Drivers WHERE UserID = ?',
      [userId]
    );
    return result.length > 0;
  }

  // Kiểm tra tồn tại theo ID
  async exists(driverId) {
    const [result] = await pool.query(
      'SELECT DriverID FROM Drivers WHERE DriverID = ?',
      [driverId]
    );
    return result.length > 0;
  }

  // Tạo tài xế mới
  async create(driverData) {
    const {
      UserID,
      Fullname,
      PhoneNumber,
      Email,
      Status = 'active'
    } = driverData;

    const [result] = await pool.query(
      `INSERT INTO Drivers (UserID, Fullname, PhoneNumber, Email, Status)
       VALUES (?, ?, ?, ?, ?)`,
      [UserID, Fullname, PhoneNumber, Email, Status]
    );

    return result;
  }

  // Cập nhật tài xế
  async update(driverId, updates) {
    const allowedFields = ['Fullname', 'PhoneNumber', 'Email', 'Status'];
    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('Không có trường nào để cập nhật');
    }

    values.push(driverId);
    const query = `UPDATE Drivers SET ${updateFields.join(', ')} WHERE DriverID = ?`;
    
    const [result] = await pool.query(query, values);
    return result;
  }

  // Cập nhật trạng thái
  async updateStatus(driverId, status) {
    const [result] = await pool.query(
      'UPDATE Drivers SET Status = ? WHERE DriverID = ?',
      [status, driverId]
    );
    return result;
  }

  // Xóa tài xế
  async delete(driverId) {
    const [result] = await pool.query(
      'DELETE FROM Drivers WHERE DriverID = ?',
      [driverId]
    );
    return result;
  }

  // Kiểm tra tài xế có đang điều khiển xe không
  async isAssignedToBus(driverId) {
    const [buses] = await pool.query(
      'SELECT BusID FROM Buses WHERE DriverID = ?',
      [driverId]
    );
    return buses.length > 0;
  }

  // Lấy xe mà tài xế đang điều khiển
  async getAssignedBus(driverId) {
    const [buses] = await pool.query(
      'SELECT * FROM Buses WHERE DriverID = ?',
      [driverId]
    );
    return buses[0];
  }

  // Lấy thống kê
  async getStats() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN Status = 'rest' THEN 1 ELSE 0 END) as rest
      FROM Drivers
    `);
    return stats[0];
  }

  // Lấy tài xế theo trạng thái
  async findByStatus(status) {
    const [drivers] = await pool.query(
      'SELECT * FROM Drivers WHERE Status = ?',
      [status]
    );
    return drivers;
  }

  // Lấy tài xế đang rảnh (active và không điều khiển xe)
  async findAvailable() {
    const [drivers] = await pool.query(`
      SELECT d.* FROM Drivers d
      LEFT JOIN Buses b ON d.DriverID = b.DriverID
      WHERE d.Status = 'active' AND b.BusID IS NULL
    `);
    return drivers;
  }

  // Lấy tài xế đang làm việc (có xe)
  async findWorking() {
    const [drivers] = await pool.query(`
      SELECT d.*, b.BusID, b.PlateNumber, b.RouteID 
      FROM Drivers d
      INNER JOIN Buses b ON d.DriverID = b.DriverID
      WHERE d.Status = 'active'
    `);
    return drivers;
  }

  // Đếm số xe mà tài xế đã điều khiển (lịch sử)
  async countAssignedBuses(driverId) {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM Buses WHERE DriverID = ?',
      [driverId]
    );
    return result[0].count;
  }

  // Tìm kiếm tài xế theo nhiều điều kiện
  async search(criteria) {
    let query = 'SELECT * FROM Drivers WHERE 1=1';
    const params = [];

    if (criteria.name) {
      query += ' AND Fullname LIKE ?';
      params.push(`%${criteria.name}%`);
    }

    if (criteria.phone) {
      query += ' AND PhoneNumber LIKE ?';
      params.push(`%${criteria.phone}%`);
    }

    if (criteria.email) {
      query += ' AND Email LIKE ?';
      params.push(`%${criteria.email}%`);
    }

    if (criteria.status) {
      query += ' AND Status = ?';
      params.push(criteria.status);
    }

    query += ' ORDER BY Fullname';

    const [drivers] = await pool.query(query, params);
    return drivers;
  }

  // Cập nhật thông tin liên hệ
  async updateContact(driverId, phoneNumber, email) {
    const [result] = await pool.query(
      'UPDATE Drivers SET PhoneNumber = ?, Email = ? WHERE DriverID = ?',
      [phoneNumber, email, driverId]
    );
    return result;
  }
}

module.exports = new DriverQueries();