const queries = require('../db/queries'); // import file queries bạn vừa tạo

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
    const { RouteID, Date, StartTime,EndTime } = req.body;

    const insertId = await queries.addSchedule(RouteID, Date, StartTime,EndTime);

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
    res.status(500).json({
      error: "Không thể thêm lịch trình",
      details: error.message,
    });
  }
}

// 🟧 Cập nhật lịch trình
async function updateSchedule(req, res) {
  try {
    const { scheduleID } = req.params;
    const { RouteID, Date, TimeStart, TimeEnd } = req.body;

    await queries.updateSchedule(scheduleID, RouteID, Date, TimeStart, TimeEnd);

    res.status(200).json({
      message: "Cập nhật lịch trình thành công",
      schedule: {
        ScheduleID: scheduleID,
        RouteID,
        Date,
        TimeStart,
        TimeEnd,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi khi cập nhật lịch trình: " + error);
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

module.exports = {
  getAllSchedules,
  getSchedulesByRouteID,
  addNewSchedule,
  updateSchedule,
  deleteSchedule,
};
