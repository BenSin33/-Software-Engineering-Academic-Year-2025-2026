const queries = require('../db/queries'); 
const pool = require('../db/pool'); 

// 1. Lấy tất cả lịch trình
async function getAllSchedules(req, res) {
  try {
    const data = await queries.getSchedules();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách lịch trình" });
  }
}

// 2. Lấy lịch trình theo RouteID
async function getSchedulesByRouteID(req, res) {
  const { routeID } = req.params;
  try {
    const schedules = await queries.getSchedulesByRouteID(routeID);
    if (!schedules || schedules.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy lịch trình nào cho tuyến này",
        schedules: [],
      });
    }
    res.status(200).json({ message: "Thành công", schedules });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
}

// 3. Thêm lịch trình mới
async function addNewSchedule(req, res) {
  try {
    const { RouteID, DriverID, BusID, Date, StartTime, EndTime } = req.body; 

    if (!DriverID) {
        return res.status(400).json({ message: "Cần phải gán Tài xế cho lịch trình" });
    }

    const insertId = await queries.addSchedule(RouteID, DriverID, BusID, Date, StartTime, EndTime);

    res.status(201).json({
      message: "Thêm lịch trình thành công",
      schedule: { ScheduleID: insertId, RouteID, DriverID, BusID, Date, StartTime, EndTime },
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm lịch trình:", error);
    res.status(500).json({ error: "Không thể thêm lịch trình", details: error.message });
  }
}

// 4. Cập nhật lịch trình
async function updateSchedule(req, res) {
  try {
    const { scheduleID } = req.params;
    const { RouteID, DriverID, Date, StartTime, EndTime } = req.body;
    
    await queries.updateSchedule(scheduleID, RouteID, DriverID, Date, StartTime, EndTime);

    res.status(200).json({
      message: "Cập nhật thành công",
      schedule: { ScheduleID: scheduleID, RouteID, DriverID, Date, StartTime, EndTime },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật", error: error.message });
  }
}

// 5. Xóa lịch trình
async function deleteSchedule(req, res) {
  try {
    const { scheduleID } = req.params;
    await queries.deleteSchedule(scheduleID);
    res.status(200).json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).send("Lỗi khi xóa: " + err);
  }
}

// 6. Lấy lịch trình của TÔI (Driver Dashboard)
async function getMySchedules(req, res) {
  try {
    const currentUserID = req.user.userID || req.user.UserID || req.user.userId;

    if (!currentUserID) {
      return res.status(401).json({ message: "Không xác thực được người dùng" });
    }

    const [driverRows] = await pool.query(
      "SELECT DriverID FROM user_service.drivers WHERE UserID = ?", 
      [currentUserID]
    );

    if (driverRows.length === 0) {
      return res.status(404).json({ message: "Tài khoản chưa liên kết với hồ sơ Tài xế" });
    }

    const myDriverID = driverRows[0].DriverID;

    const [schedules] = await pool.query(`
      SELECT 
        s.ScheduleID,
        s.RouteID,
        s.Date,
        s.TimeStart,
        s.TimeEnd,
        s.Status,
        r.RouteName,
        r.StartLocation,
        r.EndLocation,
        b.PlateNumber
      FROM schedules s
      LEFT JOIN transport_db.routes r ON s.RouteID = r.RouteID
      LEFT JOIN transport_db.buses b ON s.BusID = b.BusID
      WHERE s.DriverID = ? 
      ORDER BY s.Date DESC, s.TimeStart ASC
    `, [myDriverID]);

    return res.status(200).json({
      message: "Lấy lịch trình thành công",
      data: schedules
    });

  } catch (err) {
    console.error("Lỗi getMySchedules:", err);
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
}

// 7. Lấy lịch trình theo DriverID (Admin xem hoặc Internal Call)
async function getSchedulesByDriverID(req, res) {
  try {
    const { driverID } = req.params;
    if (!driverID) return res.status(400).json({ message: "Thiếu DriverID" });

    const [schedules] = await pool.query('SELECT * FROM schedules WHERE DriverID = ?', [driverID]);
    
    res.status(200).json({ message: "Thành công", schedules });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
}

async function updateStatus(req, res) {
  try {
    const { scheduleID } = req.params;
    const { status } = req.body; // Ví dụ: "IN_PROGRESS"
    
    if (!status) return res.status(400).json({ message: "Thiếu status" });

    // Gọi hàm query update status (Đảm bảo queries.js đã có hàm updateScheduleStatus)
    await queries.updateScheduleStatus(scheduleID, status);
    
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error("Lỗi update status:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
}

// ✅ QUAN TRỌNG: Phải export đầy đủ tên hàm tại đây
module.exports = {
  getAllSchedules,
  getSchedulesByRouteID,
  addNewSchedule,
  updateSchedule,
  deleteSchedule,
  getMySchedules,        
  getSchedulesByDriverID,
  updateStatus
};