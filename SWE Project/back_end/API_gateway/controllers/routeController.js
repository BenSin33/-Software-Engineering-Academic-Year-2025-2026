const { callService } = require("../services/callService");

// NOTE: Đây là file Controller của API GATEWAY.

exports.routeProcessing = async function () {
  try {
    // --- Gọi route_service ---
    const routeResponse = await callService("route_service", "/Routes", "GET");
    
    // KHẮC PHỤC LỖI ÁNH XẠ: route_service trả về { routes: [...] }.
    const routes = Array.isArray(routeResponse) 
      ? routeResponse 
      : (routeResponse.routes || routeResponse.data || routeResponse || []); // Lấy mảng 'routes'
    
    // --- Gọi driver_service (có thể lỗi) ---
    let drivers = [];
    try {
      const driverResponse = await callService("driver_service", "/drivers", "GET");
      drivers = Array.isArray(driverResponse)
        ? driverResponse
        : (driverResponse.drivers || driverResponse.data || driverResponse || []);
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
    const response = await callService("route_service", "/Routes", "GET");
    
    // KHẮC PHỤC LỖI ÁNH XẠ (ĐÃ SỬA CHỮA): response.routes là nơi chứa mảng thực tế
    const rawRoutes = response.routes || response.data || response || [];
    const list = Array.isArray(rawRoutes) ? rawRoutes : [];

    // Log này hiển thị mảng đã được parse. Nếu nó là rỗng, lỗi nằm ở logic map.
    console.log(`[GW DEBUG] Số lượng bản ghi đã parse thành công: ${list.length}`);


    // 2. Map lại dữ liệu để đảm bảo Frontend luôn nhận được đúng key
    const standardizedRoutes = list.map(r => ({
        // Lấy RouteID, RouteName, StartLocation, EndLocation chính xác từ DB (chữ hoa)
        RouteID: r.RouteID || r.routeID || r.id, 
        RouteName: r.RouteName || r.routeName || r.name || "Tuyến chưa đặt tên", 
        StartLocation: r.StartLocation || r.startLocation || r.start_point || "", 
        EndLocation: r.EndLocation || r.endLocation || r.end_point || "" 
    }));
    
    // Log cuối cùng phải hiển thị dữ liệu đã map
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

// --- Các hàm khác cần thiết cho Router (Để Fix ReferenceError) ---
// Router của bạn đang import các hàm này, nên chúng ta cần định nghĩa chúng.
const notImplemented = (req, res) => res.status(500).json({ message: "Logic not implemented in Gateway Controller" });

exports.getRoute = notImplemented;
exports.addNewRoute = notImplemented;
exports.updateCurrentRoute = notImplemented;
exports.deleteRoute = notImplemented;