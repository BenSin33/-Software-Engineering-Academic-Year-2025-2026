const express = require("express");
const { callService } = require("../services/callService.js");
const { routeController } = require('../controllers/routeController.js');

const router = express.Router();

/**
 * 🟢 GET /routes
 * Lấy danh sách tuyến và gộp tên tài xế (fail-safe)
 */
router.get("/", routeController);

/**
 * ➕ POST /routes/add
 * Thêm tuyến mới (fail-safe)
 */
router.post("/add", async (req, res) => {
  const { driverID, busID, routeName, startLocation, endLocation } = req.body;
  const formData = { driverID, busID, routeName, startLocation, endLocation };
  
  try {
    // --- Gọi route_service ---
    let response;
    try {
      response = await callService("route_service", "/Routes/add", "POST", formData);
    } catch (err) {
      console.warn("⚠️ Không thể thêm tuyến (route_service lỗi):", err.message);
      return res.status(500).json({ message: "Không thể thêm tuyến — lỗi route_service" });
    }

    // --- Lấy tên tài xế (fail-safe) ---
    let DriverName = "Không có dữ liệu tài xế";
    try {
      const driverResponse = await callService("user_service", `/drivers/${driverID}`, "GET");
      DriverName = driverResponse.fullName || driverResponse.FullName || DriverName;
    } catch (err) {
      console.warn("⚠️ Không thể lấy tên tài xế:", err.message);
    }

    return res.status(200).json({
      message: "Thêm tuyến mới thành công",
      newRoute: { 
        DriverID: driverID, 
        BusID: busID, 
        RouteID: response, 
        RouteName: routeName, 
        StartLocation: startLocation, 
        EndLocation: endLocation, 
        DriverName 
      }
    });
  } catch (err) {
    console.error("❌ Lỗi không mong muốn khi thêm tuyến:", err);
    return res.status(500).json({ message: "Lỗi server khi thêm tuyến mới" });
  }
});

/**
 * ✏️ POST /routes/edit/:id
 * Cập nhật tuyến (fail-safe)
 */
router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { driverID, busID, routeName, startLocation, endLocation } = req.body;
  const formData = { driverID, busID, routeName, startLocation, endLocation };

  try {
    let response;
    try {
      response = await callService("route_service", `/Routes/edit/${id}`, "POST", formData);
    } catch (err) {
      console.warn("⚠️ Không thể cập nhật tuyến:", err.message);
      return res.status(500).json({ message: "Không thể cập nhật tuyến — lỗi route_service" });
    }

    let DriverName = "Không có dữ liệu tài xế";
    try {
      const driverResponse = await callService("user_service", `/drivers/${driverID}`, "GET");
      DriverName = driverResponse.fullName || driverResponse.FullName || DriverName;
    } catch (err) {
      console.warn("⚠️ Không thể lấy tên tài xế:", err.message);
    }

    return res.status(200).json({
      message: "Cập nhật tuyến thành công",
      updatedRoute: { 
        BusID: busID, 
        RouteName: routeName, 
        StartLocation: startLocation, 
        EndLocation: endLocation, 
        DriverID: driverID, 
        DriverName, 
        RouteID: id 
      }
    });
  } catch (err) {
    console.error("❌ Lỗi không mong muốn khi cập nhật tuyến:", err);
    return res.status(500).json({ message: "Lỗi server khi cập nhật tuyến" });
  }
});

/**
 * 🗑️ POST /routes/delete/:id
 * Xóa tuyến (fail-safe)
 */
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await callService("route_service", `/Routes/delete/${id}`, "POST");
    return res.status(200).json({
      message: "Xóa tuyến thành công",
      response
    });
  } catch (err) {
    console.warn("⚠️ Không thể xóa tuyến:", err.message);
    return res.status(500).json({ message: "Lỗi server khi xóa tuyến" });
  }
});

module.exports = router;
