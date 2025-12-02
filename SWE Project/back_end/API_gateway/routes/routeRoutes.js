const express = require("express");
const { callService } = require("../services/callService.js");

// Import controller (không dùng dấu { })
const routeController = require('../controllers/routeController.js');

const router = express.Router();

// ==========================================
// 1. GET /routes (Lấy danh sách)
// ==========================================

// ✅ CHỈ GIỮ LẠI DÒNG NÀY:
router.get('/', routeController.getAllRoutes);


// ==========================================
// 2. POST /routes/add (Thêm mới)
// ==========================================
router.post("/add", async (req, res) => {
  const { driverID, busID, routeName, startLocation, endLocation } = req.body;
  const formData = { driverID, busID, routeName, startLocation, endLocation };
  
  try {
    let newRouteID;
    try {
      const response = await callService("route_service", "/Routes/add", "POST", formData);
      newRouteID = response.insertId || response.id || response; 
    } catch (err) {
      console.warn("⚠️ Lỗi route_service:", err.message);
      return res.status(500).json({ message: "Không thể thêm tuyến vào DB" });
    }

    let DriverName = "Đang cập nhật";
    if (driverID) {
        try {
          const driverRes = await callService("user_service", `/drivers/${driverID}`, "GET");
          DriverName = driverRes.fullName || driverRes.FullName || DriverName;
        } catch (err) {
          console.warn(`⚠️ Không tìm thấy tài xế ${driverID}:`, err.message);
        }
    }

    return res.status(200).json({
      message: "Thêm tuyến mới thành công",
      newRoute: { 
        RouteID: newRouteID, 
        RouteName: routeName, 
        StartLocation: startLocation, 
        EndLocation: endLocation, 
        BusID: busID, 
        DriverID: driverID, 
        DriverName: DriverName 
      }
    });

  } catch (err) {
    console.error("❌ Lỗi Gateway Add Route:", err);
    return res.status(500).json({ message: "Lỗi server Gateway" });
  }
});


// ==========================================
// 3. POST /routes/edit/:id (Cập nhật)
// ==========================================
router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { driverID, busID, routeName, startLocation, endLocation } = req.body;
  const formData = { driverID, busID, routeName, startLocation, endLocation };

  try {
    await callService("route_service", `/Routes/edit/${id}`, "POST", formData);

    let DriverName = "Đang cập nhật";
    if (driverID) {
        try {
          const driverRes = await callService("user_service", `/drivers/${driverID}`, "GET");
          DriverName = driverRes.fullName || driverRes.FullName || DriverName;
        } catch (err) { console.warn("Lỗi lấy tên tài xế:", err.message); }
    }

    return res.status(200).json({
      message: "Cập nhật tuyến thành công",
      updatedRoute: { 
        RouteID: id,
        RouteName: routeName, 
        StartLocation: startLocation, 
        EndLocation: endLocation, 
        BusID: busID, 
        DriverID: driverID, 
        DriverName: DriverName
      }
    });
  } catch (err) {
    console.error("❌ Lỗi Gateway Edit Route:", err);
    return res.status(500).json({ message: "Lỗi server khi cập nhật" });
  }
});


// ==========================================
// 4. POST /routes/delete/:id (Xóa)
// ==========================================
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await callService("route_service", `/Routes/delete/${id}`, "POST");
    return res.status(200).json({
      message: "Xóa tuyến thành công",
      response
    });
  } catch (err) {
    console.warn("⚠️ Lỗi xóa tuyến:", err.message);
    return res.status(500).json({ message: "Không thể xóa tuyến" });
  }
});

module.exports = router;