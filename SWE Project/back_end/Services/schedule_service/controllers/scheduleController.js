const queries = require('../db/queries'); // import file queries bạn vừa tạo
const pool = require('../db/pool'); // import pool để truy vấn trực tiếp khi cần

// 🟩 Lấy tất cả lịch trình
async function getAllSchedules(req, res) {
  try {
    const data = await queries.getSchedules();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách lịch trình" });
  }
}

// 🟨 Lấy lịch trình theo RouteID
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

    res.status(200).json({
      message: "Fetch lịch trình theo tuyến thành công",
      schedules,
    });
  } catch (err) {
    console.error("Lỗi khi lấy lịch trình:", err);
    return res.status(500).json({
      message: "Lỗi server khi lấy danh sách lịch trình",
    });
  }
}

// 🟦 Thêm lịch trình mới
async function addNewSchedule(req, res) {
  try {
    // Nhớ destructure thêm DriverID
    const { RouteID, DriverID, Date, StartTime, EndTime } = req.body; 

    if (!DriverID) {
        return res.status(400).json({ message: "Cần phải gán Tài xế cho lịch trình" });
    }

    const insertId = await queries.addSchedule(RouteID, Date, StartTime, EndTime);

    res.status(201).json({
      message: "Thêm lịch trình thành công",
      schedule: {
        ScheduleID: insertId,
        RouteID,
        Date,
        StartTime,
        EndTime,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm lịch trình:", error);
    res.status(500).json({ error: "Không thể thêm lịch trình", details: error.message });
  }
}

async function getSchedulesByDriver(req, res) {
  try {
    const { driverID } = req.params;
    const schedules = await queries.getSchedulesByDriverID(driverID);
    
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Lỗi lấy lịch trình driver:", error);
    res.status(500).json({ message: "Lỗi khi lấy lịch trình của tài xế" });
  }
}

// 🟧 Cập nhật lịch trình
async function updateSchedule(req, res) {
  try {
    const { scheduleID } = req.params;
    const { RouteID, DriverID, Date, StartTime, EndTime } = req.body;
    
    await queries.updateSchedule(scheduleID, RouteID, DriverID, Date, StartTime, EndTime);

    res.status(200).json({
      message: "Cập nhật lịch trình thành công",
      schedule: { ScheduleID: scheduleID, RouteID, DriverID, Date, StartTime, EndTime },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật", error: error.message });
  }
}

// 🟥 Xóa lịch trình
async function deleteSchedule(req, res) {
  try {
    const { scheduleID } = req.params;
    await queries.deleteSchedule(scheduleID);
    res.status(200).json({ message: "Xóa lịch trình thành công" });
  } catch (err) {
    console.error(err);
    res.status(501).send("Lỗi khi xóa lịch trình: " + err);
  }
}

async function getSchedulesByDriverID(req, res) {
  try {
    const { driverID } = req.params; // Lấy từ URL /driver/:driverID

    if (!driverID) {
      return res.status(400).json({ message: "Thiếu DriverID" });
    }

    const schedules = await queries.getSchedulesByDriverID(driverID);
    
    // Trả về mảng rỗng cũng là thành công (nghĩa là không có lịch)
    res.status(200).json({
      message: "Lấy lịch trình tài xế thành công",
      schedules: schedules || [],
    });

  } catch (err) {
    console.error("Lỗi lấy lịch tài xế:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
}

async function getMySchedules(req, res) {
  try {
    // 1. Lấy UserID từ Token (do middleware verifyToken giải mã)
    const currentUserID = req.user.userID || req.user.UserID || req.user.userId;

    console.log("Token Payload:", req.user); 
    console.log("Current UserID:", currentUserID);

    if (!currentUserID) {
      return res.status(401).json({ message: "Không xác thực được người dùng" });
    }

    console.log("Đang tìm lịch cho UserID:", currentUserID);

    // 2. Tìm DriverID dựa trên UserID
    // (Vì bảng schedules lưu DriverID chứ không lưu UserID)
    const [driverRows] = await pool.query(
      "SELECT DriverID FROM user_service.drivers WHERE UserID = ?", 
      [currentUserID]
    );

    if (driverRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ tài xế." });
    }

    const myDriverID = driverRows[0].DriverID;

    // 3. Lấy lịch trình dựa trên DriverID
    const [schedules] = await pool.query(`
      SELECT 
        s.ScheduleID,
        s.RouteID,
        s.Date,
        s.TimeStart,
        s.TimeEnd,
        r.RouteName,                 -- Lấy tên tuyến
        r.StartLocation,
        r.EndLocation,
        b.PlateNumber                -- Lấy biển số xe
      FROM schedules s
      
      -- 1. JOIN BẢNG ROUTES (Thử 'transport_db' trước, nếu lỗi thì thử 'routes_db')
      -- Chú ý: s.RouteID khớp với r.RouteID (theo file SQL của bạn)
      LEFT JOIN transport_db.routes r ON s.RouteID = r.RouteID  

      -- 2. JOIN BẢNG BUSES (Nếu bảng buses nằm ở transport_db thì dùng transport_db, nếu ở bus_service_db thì đổi lại)
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

module.exports = {
  getAllSchedules,
  getSchedulesByRouteID,
  addNewSchedule,
  updateSchedule,
  deleteSchedule,
};
