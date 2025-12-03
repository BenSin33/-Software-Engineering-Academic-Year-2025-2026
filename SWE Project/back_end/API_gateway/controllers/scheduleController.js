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
      // ✅ SỬA: Trả về null nếu không có ID, để bên Router tự fallback về 'D001'/'BUS-01'
      driverID: resolvedDriverID || null,
      busID: routeData?.BusID || null, 
      
      // Các trường hiển thị (Display) thì giữ nguyên text cho đẹp
      routeName: routeData?.RouteName || "không có dữ liệu",
      driverName: driverData?.DriverName || "không có dữ liệu",
    };
  } catch (error) {
    return {
      driverID: null, // ✅ Null
      busID: null,    // ✅ Null
      routeName: "không có dữ liệu",
      driverName: "không có dữ liệu",
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
    // 1. Lấy Schedules
    let schedules = [];
    try {
      const sRes = await callService("schedule_service", "/Schedules", "GET");
      schedules = sRes.schedules || sRes.data || sRes || [];
      if (!Array.isArray(schedules)) schedules = [];
    } catch (err) { console.warn("Lỗi Schedule Service:", err.message); }
    
    // 2. Lấy Routes
    let routes = [];
    try {
        const rRes = await callService("route_service", "/Routes", "GET"); 
        routes = rRes.data || rRes || [];
        if (!Array.isArray(routes)) routes = [];
    } catch (err) { console.warn("Lỗi Route Service:", err.message); }

    // --- DEBUG LOG ---
    console.log(`\n🔹 MERGE START: ${schedules.length} schedules vs ${routes.length} routes`);
    if(routes.length > 0) console.log("👉 Sample Route ID:", routes[0].RouteID, "Type:", typeof routes[0].RouteID);
    if(schedules.length > 0) console.log("👉 Sample Schedule RouteID:", schedules[0].RouteID, "Type:", typeof schedules[0].RouteID);

    const { getStatus } = require("../utils/utils");

    // 3. Ghép dữ liệu (Logic chấp nhận mọi kiểu tên)
    const mergedData = schedules.map((schedule) => {
      
      const sID = schedule.RouteID || schedule.routeID;

      // Tìm Route tương ứng (Ép kiểu về String để so sánh)
      const matchedRoute = routes.find((r) => {
          const rID = r.RouteID || r.routeID || r.id; 
          return String(rID) === String(sID); 
      });

      return {
        ScheduleID: schedule.ScheduleID,
        RouteID: sID,
        
        // Nếu tìm thấy -> Lấy tên thật.
        // Nếu không thấy -> Fallback hiển thị ID (để đỡ xấu giao diện)
        RouteName: matchedRoute ? (matchedRoute.RouteName || matchedRoute.name) : `Tuyến số ${sID}`,
        
        // Fallback thông minh cho Bus/Driver
        BusID: schedule.BusID || matchedRoute?.BusID || "---",
        DriverName: matchedRoute?.DriverName || schedule.DriverID || "---", 
        
        StartTime: schedule.TimeStart || "--:--",
        EndTime: schedule.TimeEnd || "--:--",
        Date: schedule.Date || "",
        Status: schedule.Status || getStatus(schedule.TimeStart, schedule.TimeEnd, schedule.Date),
      };
    });

    return res.status(200).json({
      message: "Lấy dữ liệu thành công",
      mergedData,
    });
  } catch (err) {
    console.error("❌ Lỗi getAllSchedules:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};