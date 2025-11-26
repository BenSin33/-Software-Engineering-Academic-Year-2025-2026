const express = require("express");
const { callService } = require("../services/callService.js");

const router = express.Router();

router.post("/coordinates", async (req, res) => {
  const routeReq = req.body; // rename để tránh trùng

  let addressArr = [];
  let coordinates = [];

  try {
    // 🔹 Lấy danh sách điểm đón từ student_service
    const studentRes = await callService(
      "student_service",
      `/students/route/${routeReq.RouteID}/PickUpPoint`,
      "GET"
    );
  

    addressArr = studentRes.students || [];

    // 🔹 Lấy điểm trả từ route_service
    let routeData = null;
    try {
      routeData = await callService(
        "route_service",
        `/Routes/${routeReq.RouteID}`,
        "GET"
      );


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
    return res.status(200).json({
      message: "Tạo mảng tọa độ tuyến đường thành công",
      coordinates,
    });

  } catch (err) {
    console.error("Lỗi chung:", err);
    return res.status(500).json({ message: "Lỗi server khi xử lý dữ liệu" });
  }
});


module.exports = router;
