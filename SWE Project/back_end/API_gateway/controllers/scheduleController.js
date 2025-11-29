const axios = require("axios");
const { callService } = require("../services/callService");
const { routeProcessing } = require("./routeController");

// URL của Service con
const SCHEDULE_SERVICE_URL = process.env.SCHEDULE_SERVICE_URL || "http://schedule_service:5005";

// ==========================================
// 1. HÀM CHO DRIVER (Lấy lịch của tôi)
// ==========================================
exports.getMySchedules = async function (req, res) {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ message: "No token provided from Gateway" });
    }

    const response = await axios.get(`${SCHEDULE_SERVICE_URL}/Schedules/driver/my-schedules`, {
      headers: { Authorization: token },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Gateway Error (getMySchedules):", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: "Lỗi kết nối tới Schedule Service" });
  }
};

// ==========================================
// 2. HÀM HỖ TRỢ (Get Data nội bộ)
// ==========================================
exports.getScheduleData = async function (routeID, driverID = null) {
  let routeData = null;
  let driverData = null;

  try {
    if (routeID) {
      try {
        routeData = await callService("route_service", `/Routes/${routeID}`, "GET");
      } catch (err) {
        console.warn("⚠️ Route không tồn tại:", err.message);
      }
    }

    const resolvedDriverID = driverID || routeData?.driverID;

    if (resolvedDriverID) {
      try {
        driverData = await callService("driver_service", `/Drivers/${resolvedDriverID}`, "GET");
      } catch (err) {
        console.warn("⚠️ Driver không tồn tại:", err.message);
      }
    }

    return {
      driverID: resolvedDriverID,
      routeName: routeData?.RouteName || "không có dữ liệu",
      driverName: driverData?.DriverName || "không có dữ liệu",
      busID: routeData?.BusID || "không có dữ liệu",
    };
  } catch (error) {
    return {
      routeName: "không có dữ liệu",
      driverName: "không có dữ liệu",
      busID: "không có dữ liệu",
    };
  }
};

// ==========================================
// 3. HÀM CHO ADMIN (Lấy tất cả) - ✅ ĐÃ SỬA TÊN TẠI ĐÂY
// ==========================================
// ⚠️ Cũ: exports.scheduleController = ... (Sai tên)
// ✅ Mới: exports.getAllSchedules = ... (Đúng tên router đang gọi)
exports.getAllSchedules = async function (req, res) {
  try {
    let schedules = [];
    try {
      const scheduleResponse = await callService("schedule_service", "/Schedules", "GET");
      schedules = scheduleResponse.schedules || scheduleResponse || [];
    } catch (err) {
      console.warn("⚠️ Lỗi khi lấy dữ liệu schedule_service:", err.message);
    }
    
    // Lưu ý: Đảm bảo đường dẫn file utils đúng
    const { getStatus } = require("../utils/utils"); 
    
    const routes = await routeProcessing();

    const mergedData = schedules.map((schedule) => {
      const matchedRoute = routes.find((r) => r.RouteID === schedule.RouteID);
      return {
        ScheduleID: schedule.ScheduleID || "Không có dữ liệu",
        RouteID: matchedRoute ? schedule.RouteID : "Không có dữ liệu",
        RouteName: matchedRoute ? matchedRoute.RouteName : "Không có dữ liệu",
        BusID: matchedRoute ? matchedRoute.BusID : "Không có dữ liệu",
        DriverName: matchedRoute ? matchedRoute.DriverName : "Không có dữ liệu",
        StartTime: schedule.TimeStart || "Không có dữ liệu",
        EndTime: schedule.TimeEnd || "Không có dữ liệu",
        Date: schedule.Date || "Không có dữ liệu",
        Status: getStatus(schedule.TimeStart, schedule.TimeEnd, schedule.Date),
      };
    });

    return res.status(200).json({
      message: "Lấy dữ liệu thành công",
      mergedData,
    });
  } catch (err) {
    console.error("❌ Lỗi không mong muốn:", err);
    return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu schedule" });
  }
};