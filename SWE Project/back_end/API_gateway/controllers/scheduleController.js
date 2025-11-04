const { callService } = require("../services/callService");
const { routeProcessing } = require("./routeController");

exports.getScheduleData=async function(routeID, driverID = null) {
  let routeData = null;
  let driverData = null;

  try {
    // Gọi route_service nếu có routeID
    if (routeID) {
      try {
        routeData = await callService("route_service", `/Routes/${routeID}`, "GET");
      } catch (err) {
        console.warn("⚠️ Route không tồn tại hoặc service lỗi:", err.message);
      }
    }

    // Nếu chưa có driverID mà route có thì lấy từ route
    const resolvedDriverID = driverID || routeData?.driverID;

    // Gọi driver_service nếu có driverID
    if (resolvedDriverID) {
      try {
        driverData = await callService("driver_service", `/Drivers/${resolvedDriverID}`, "GET");
      } catch (err) {
        console.warn("⚠️ Driver không tồn tại hoặc service lỗi:", err.message);
      }
    }

    return {
      routeName: routeData?.RouteName || "không có dữ liệu",
      driverName: driverData?.DriverName || "không có dữ liệu",
      busID: routeData?.BusID || "không có dữ liệu",
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu schedule:", error.message);
    return {
      routeName: "không có dữ liệu",
      driverName: "không có dữ liệu",
      busID: "không có dữ liệu",
    };
  }
}

exports.scheduleController = async function (req, res) {
  try {
    // --- 1️⃣ Lấy danh sách Schedule ---
    let schedules = [];
    try {
      const scheduleResponse = await callService("schedule_service", "/Schedules", "GET");
      schedules = scheduleResponse.schedules || scheduleResponse || [];
    } catch (err) {
      console.warn("⚠️ Lỗi khi lấy dữ liệu schedule_service:", err.message);
    }

    // --- 2️⃣ Gọi lại routeProcessing nội bộ ---
    const routes = await routeProcessing();

    // --- 3️⃣ Gộp dữ liệu ---
    const mergedData = schedules.map((schedule) => {
      const matchedRoute = routes.find((r) => r.RouteID === schedule.RouteID);
      return {
        ScheduleID: schedule.ScheduleID || "Không có dữ liệu",
        RouteID: schedule.RouteID || "Không có dữ liệu",
        BusID: matchedRoute ? matchedRoute.BusID : "Không có dữ liệu",
        DriverName: matchedRoute ? matchedRoute.DriverName : "Không có dữ liệu",
        StartTime: schedule.StartTime || "Không có dữ liệu",
        EndTime: schedule.EndTime || "Không có dữ liệu",
        Date: schedule.Date || "Không có dữ liệu",
      };
    });
    console.log('d: ',mergedData)
    // --- 4️⃣ Trả kết quả ---
    return res.status(200).json({
      message: "Lấy dữ liệu schedule + route + driver thành công",
      mergedData,
    });
  } catch (err) {
    console.error("❌ Lỗi không mong muốn:", err);
    return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu schedule" });
  }
};
