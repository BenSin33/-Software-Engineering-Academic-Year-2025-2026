const { callService } = require("../services/callService");


exports.routeProcessing = async function () {
  try {
    // --- Gọi route_service ---
    const routeResponse = await callService("route_service", "/Routes", "GET");
    const routes = routeResponse.routes || routeResponse || [];

    // --- Gọi driver_service (có thể lỗi) ---
    let drivers = [];
    try {
      const driverResponse = await callService("driver_service", "/drivers", "GET");
      drivers = driverResponse.drivers || driverResponse || [];
    } catch (driverErr) {
      console.warn("⚠️ Không thể lấy dữ liệu tài xế:", driverErr.message);
      // drivers giữ nguyên là []
    }
    // --- Ghép dữ liệu ---
    return routes.map((route) => {
      const driver = drivers.find((d) => d.driverID === route.driverID);
      return {
        ...route,
        DriverName: driver ? driver.fullName : "Không tìm thấy tài xế",
      };
    });
  } catch (err) {
    console.error("❌ Lỗi trong routeProcessing:", err.message);
    return [];
  }
};

// Controller để router gọi trực tiếp
exports.routeController = async function (req, res) {
  const routes = await exports.routeProcessing();
  res.status(200).json({ message: "Lấy dữ liệu thành công", routes });
};
