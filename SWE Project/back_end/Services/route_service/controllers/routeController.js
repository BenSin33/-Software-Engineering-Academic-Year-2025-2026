const queries = require('../db/queries');

async function getAllRoutes(req, res) {
  try {
    const routes = await queries.getRoutes();
    
    // --- DEBUG LOG CỦA CONTROLLER ---
    console.log("🟢 [Controller] Dữ liệu cuối cùng nhận được từ DB:", routes.length);
    // -------------------------------------
    
    if (!routes || routes.length === 0) {
      return res.status(200).json({ message: 'Không có dữ liệu tuyến đường', routes: [] });
    }
    // Nếu có dữ liệu, trả về { routes: [...] }
    return res.status(200).json({ routes }); 
  } catch (err) {
    // Nếu queries.getRoutes() ném lỗi (ví dụ: Timeout), sẽ bắt ở đây và trả về 500
    console.error('❌ Server error (Lỗi DB):', err);
    return res.status(500).json({ message: 'Lỗi server (DB error)', error: err.message });
  }
}

async function getRoute(req, res) {
  try {
    const { RouteID } = req.params;

    if (!RouteID) {
      return res.status(400).json({ message: "RouteID is required" });
    }

    const route = await queries.getRouteByID(RouteID);

    if (!route || route.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.status(200).json(route[0]);

  } catch (error) {
    console.error("❌ Error fetching route:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

async function addNewRoute(req, res) {
  try {
    const { driverID, busID, routeName, startLocation, endLocation,status } = req.body;
    if (!routeName || !startLocation || !endLocation || !status) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const RouteID = await queries.addRoute(driverID, busID, routeName, startLocation, endLocation,status);
    
    res.status(201).json({
      message: "Thêm tuyến thành công",
      RouteID,
      data: { driverID, busID, routeName, startLocation, endLocation,status }
    });

  } catch (error) {
    console.error("❌ Error adding route:", error);
    res.status(500).json({ message: "Error adding route", error: error.message });
  }
}

async function updateCurrentRoute(req, res) {
  try {
    const { routeID } = req.params;
    const { driverID, busID, routeName, startLocation, endLocation,status } = req.body;
    
    await queries.updateCurrentRoute(routeID, driverID, busID, routeName, startLocation, endLocation,status);
    
    res.status(200).json({
      message: 'Cập nhật tuyến thành công',
      route: { driverID, busID, routeName, startLocation, endLocation, status }
    });
  } catch (error) {
    console.error("❌ Error updating route:", error);
    res.status(500).json({ message: "Error updating route", error: error.message });
  }
}

async function deleteRoute(req, res) {
  try {
    const { routeID } = req.params;
    await queries.deleteRoute(routeID);
    res.status(200).json({ message: 'Xóa tuyến thành công' });
  } catch (err) {
    console.error("❌ Error deleting route:", err);
    res.status(500).json({ message: 'Error deleting route', error: err.message });
  }
}

module.exports = {
  getAllRoutes,
  addNewRoute,
  updateCurrentRoute,
  deleteRoute,
  getRoute
};