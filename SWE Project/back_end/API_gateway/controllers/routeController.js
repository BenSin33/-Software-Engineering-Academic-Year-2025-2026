const { callService } = require("../services/callService");


exports.routeProcessing = async function () {
  try {
    // --- Gọi route_service ---
    const routeResponse = await callService("route_service", "/Routes", "GET");
    
    // Handle both response types
    const routes = Array.isArray(routeResponse) 
      ? routeResponse 
      : (routeResponse.routes || routeResponse || []);

    // --- Gọi driver_service (có thể lỗi) ---
    let drivers = [];
    try {
      const driverResponse = await callService("driver_service", "/drivers", "GET");
      drivers = Array.isArray(driverResponse)
        ? driverResponse
        : (driverResponse.drivers || driverResponse || []);
    } catch (driverErr) {
      console.warn("⚠️ Không thể lấy dữ liệu tài xế:", driverErr.message);
      // drivers giữ nguyên là []
    }

    // --- Ghép dữ liệu ---
    return routes.map((route) => {
      const driver = drivers.find((d) => d.DriverID === route.DriverID || d.driverID === route.DriverID);
      return {
        ...route,
        DriverName: driver ? (driver.fullName || driver.FullName || "Không tìm thấy tài xế") : "Không tìm thấy tài xế",
      };
    });
  } catch (err) {
    console.error("❌ Lỗi trong routeProcessing:", err.message);
    return [];
  }
};

// Controller để router gọi trực tiếp
exports.routeController = async function (req, res) {
  try {
    const routes = await exports.routeProcessing();
    res.status(200).json({ message: "Lấy dữ liệu thành công", routes });
  } catch (err) {
    console.error("❌ Lỗi trong routeController:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    // 1. Gọi sang route_service
    // Lưu ý: Đảm bảo đường dẫn '/Routes' khớp với server.js của route_service
    const response = await callService("route_service", "/Routes", "GET");
    
    const rawRoutes = response.data || response || [];
    const list = Array.isArray(rawRoutes) ? rawRoutes : [];

    // 2. Map lại dữ liệu để đảm bảo Frontend luôn nhận được đúng key
    const standardizedRoutes = list.map(r => ({
        // Ưu tiên lấy RouteID (hoa), nếu không có thì lấy routeID (thường) hoặc id
        RouteID: r.RouteID || r.routeID || r.id, 
        RouteName: r.RouteName || r.name || "Tuyến chưa đặt tên",
        StartLocation: r.StartLocation || r.start_point || "",
        EndLocation: r.EndLocation || r.end_point || ""
    }));

    console.log("👉 Data Routes trả về Frontend:", JSON.stringify(standardizedRoutes, null, 2));

    return res.status(200).json({
      message: "Lấy danh sách tuyến thành công",
      data: standardizedRoutes
    });

  } catch (error) {
    console.error("Gateway Error (getAllRoutes):", error.message);
    return res.status(500).json({ message: "Lỗi khi lấy danh sách tuyến" });
  }
};