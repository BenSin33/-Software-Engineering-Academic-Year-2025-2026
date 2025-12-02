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
  const { driverID, busID, routeName, startLocation, endLocation, status } = req.body;
  const formData = { driverID, busID, routeName, startLocation, endLocation, status };
  
  try {
    let newRouteID;
    try {
      const response = await callService("route_service", "/Routes/add", "POST", formData);
      newRouteID = response.insertId || response.id || response; 
    } catch (err) {
      console.warn("⚠️ Lỗi route_service:", err.message);
      return res.status(500).json({ message: "Không thể thêm tuyến vào DB" });
    }
    const route = response; // RouteID mới được tạo

    // --- Cập nhật Driver bên user_service ---
    try {
      await callService(
        "user_service",
        `/api/drivers/${driverID}`,
        "PUT",
        { routeID: route.RouteID, busID: route.data.busID }
      );
    } catch (err) {
      console.warn("⚠️ Không thể update RouteID cho driver:", err.message);
      // Không return — vẫn tiếp tục
    }

    // --- Cập nhật Bus để gán RouteID ---
    try {
      await callService(
        "bus_service",                 // service bus
        `/api/buses/${busID}`,         // API update bus
        "PUT",
        { RouteID: route.RouteID }     // body chứa routeID
      );
    } catch (err) {
      console.warn("⚠️ Không thể update RouteID cho bus:", err.message);
      // Không return — vẫn tiếp tục
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
        RouteID: route.RouteID,
        RouteName: routeName,
        StartLocation: startLocation,
        EndLocation: endLocation,
        DriverName,
        Status: status
      }
    });

  } catch (err) {
    console.error("❌ Lỗi Gateway Add Route:", err);
    return res.status(500).json({ message: "Lỗi server Gateway" });
  }
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { driverID, busID, routeName, startLocation, endLocation, status } = req.body;
  const formData = { driverID, busID, routeName, startLocation, endLocation, status };

  try {
    // --- Lấy thông tin tuyến cũ trước khi update ---
    let oldRoute = null;
    try {
      oldRoute = await callService("route_service", `/Routes/${id}`, "GET");
    } catch (err) {
      console.warn("⚠️ Không thể lấy thông tin tuyến cũ:", err.message);
    }

    // --- Cập nhật route_service ---
    let response;
    try {
      response = await callService("route_service", `/Routes/edit/${id}`, "POST", formData);
    } catch (err) {
      console.warn("⚠️ Không thể cập nhật tuyến:", err.message);
      return res.status(500).json({ message: "Không thể cập nhật tuyến — lỗi route_service" });
    }

    // --- Cập nhật Driver mới (gán RouteID và BusID) ---
    if (driverID) {
      try {
        await callService(
          "user_service",
          `/api/drivers/${driverID}`,
          "PUT",
          { routeID: id, busID: busID }
        );
      } catch (err) {
        console.warn("⚠️ Không thể update RouteID cho driver mới:", err.message);
      }
    }
    console.log('old route: ',oldRoute)
    // --- Xóa RouteID khỏi Driver cũ (nếu driver thay đổi) ---
    if (oldRoute && oldRoute.DriverID && oldRoute.DriverID !== driverID) {
      try {
        await callService(
          "user_service",
          `/api/drivers/${oldRoute.DriverID}`,
          "PUT",
          { routeID: 'Null', busID: 'Null' }
        );
      } catch (err) {
        console.warn("⚠️ Không thể xóa RouteID khỏi driver cũ:", err.message);
      }
    }

    // --- Cập nhật Bus mới (gán RouteID) ---
    if (busID) {
      try {
        await callService(
          "bus_service",
          `/api/buses/${busID}`,
          "PUT",
          { RouteID: id }
        );
      } catch (err) {
        console.warn("⚠️ Không thể update RouteID cho bus mới:", err.message);
      }
    }

    // --- Xóa RouteID khỏi Bus cũ (nếu bus thay đổi) ---
    if (oldRoute && oldRoute.BusID && oldRoute.BusID !== busID) {
      try {
        await callService(
          "bus_service",
          `/api/buses/${oldRoute.BusID}`,
          "PUT",
          { RouteID: 'Null' }
        );
      } catch (err) {
        console.warn("⚠️ Không thể xóa RouteID khỏi bus cũ:", err.message);
      }
    }

    // --- Lấy tên tài xế (fail-safe) ---
    let DriverName = "Không có dữ liệu tài xế";
    if (driverID) {
      try {
        const driverResponse = await callService("user_service", `/drivers/${driverID}`, "GET");
        DriverName = driverResponse.fullName || driverResponse.FullName || DriverName;
      } catch (err) {
        console.warn("⚠️ Không thể lấy tên tài xế:", err.message);
      }
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
        DriverName, 
        RouteID: id,
        Status: status
      }
    });
  } catch (err) {
    console.error("❌ Lỗi Gateway Edit Route:", err);
    return res.status(500).json({ message: "Lỗi server khi cập nhật" });
  }
});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    // --- Lấy thông tin tuyến trước khi xóa ---
    let routeInfo = null;
    try {
      routeInfo = await callService("route_service", `/Routes/${id}`, "GET");
    } catch (err) {
      console.warn("⚠️ Không thể lấy thông tin tuyến:", err.message);
    }
     console.log('routeInfo: ',routeInfo)
    // --- Xóa RouteID khỏi Driver ---
    if (routeInfo && routeInfo.DriverID) {
      console.log('minina')
      try {
        await callService(
          "user_service",
          `/api/drivers/${routeInfo.DriverID}`,
          "PUT",
          { routeID: 'Null', busID: 'Null' }
        );
      } catch (err) {
        console.warn("⚠️ Không thể xóa RouteID khỏi driver:", err.message);
      }
    }

    // --- Xóa RouteID khỏi Bus ---
    if (routeInfo && routeInfo.BusID) {
      try {
        await callService(
          "bus_service",
          `/api/buses/${routeInfo.BusID}`,
          "PUT",
          { RouteID: 'Null' }
        );
      } catch (err) {
        console.warn("⚠️ Không thể xóa RouteID khỏi bus:", err.message);
      }
    }

    // --- Xóa tuyến trong route_service ---
    const response = await callService("route_service", `/Routes/delete/${id}`, "POST");
    
    return res.status(200).json({
      message: "Xóa tuyến thành công",
      deletedRouteID: id,
      response
    });
  } catch (err) {
    console.warn("⚠️ Lỗi xóa tuyến:", err.message);
    return res.status(500).json({ message: "Không thể xóa tuyến" });
  }
});

module.exports = router;

