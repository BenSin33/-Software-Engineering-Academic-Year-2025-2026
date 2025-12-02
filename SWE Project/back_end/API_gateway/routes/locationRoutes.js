const express = require("express");
const { callService } = require("../services/callService.js");

const router = express.Router();

router.post("/coordinates", async (req, res) => {
  const routeReq = req.body; // rename để tránh trùng
  console.log('fe')
  let addressArr = [];
  let coordinates = [];

  try {
    // 🔹 Lấy danh sách điểm đón từ student_service
    const studentRes = await callService(
      "student_service",
      `/students/route/${routeReq.RouteID}/PickUpPoint`,
      "GET"
    );
    console.log('student: ',studentRes)

    addressArr = studentRes.students || [];

    // 🔹 Lấy điểm trả từ route_service
    let routeData = null;
    try {
      routeData = await callService(
        "route_service",
        `/Routes/${routeReq.RouteID}`,
        "GET"
      );

      console.log('route: ',routeData)
      if (Array.isArray(routeData) && routeData.length > 0) {
        const startLocation = routeData[0].StartLocation;
        const endLocation = routeData[0].EndLocation;

        if (startLocation) addressArr.unshift(startLocation); // thêm vào đầu
        if (endLocation) addressArr.push(endLocation);       // thêm vào cuối
      }
    } catch (err) {
      console.error("Lỗi call route_service:", err);
    }

    if (addressArr.length === 0) {
      return res.status(400).json({ message: "Không đủ địa chỉ để tạo tuyến đường" });
    }
    // 🔹 Chuyển đổi địa chỉ thành tọa độ
    const coordinatesData = await callService(
      "location_service",
      "/api/locations/coordinates",
      "POST",
      addressArr
    );
    
    coordinates = coordinatesData.coordinates || [];
    console.log('cor: ',coordinatesData)
    return res.status(200).json({
      message: "Tạo mảng tọa độ tuyến đường thành công",
      coordinates,
    });

  } catch (err) {
    console.error("Lỗi chung:", err);
    return res.status(500).json({ message: "Lỗi server khi xử lý dữ liệu" });
  }
});

// POST: Driver gửi tọa độ
router.post("/update/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    // Forward sang service location
    const result = await callService(
        "location_service", 
        `/Location/update/${scheduleId}`, 
        "POST", 
        req.body
    );
    res.json(result);
  } catch (err) {
    console.error("Gateway Location Error:", err.message);
    res.status(500).json({ message: "Lỗi Gateway Location" });
  }
});

// GET: Admin lấy tọa độ
router.get("/latest/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const result = await callService(
        "location_service", 
        `/Location/latest/${scheduleId}`, 
        "GET"
    );
    res.json(result);
  } catch (err) {
    // Nếu service con trả về 404 (chưa có tọa độ), gateway cũng nên trả về null hoặc lỗi nhẹ nhàng
    res.status(200).json({ data: null, message: "Chưa có dữ liệu" });
  }
});


module.exports = router;
