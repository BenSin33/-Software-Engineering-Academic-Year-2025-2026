const express = require("express");
const { callService } = require("../services/callService.js");

const router = express.Router();

router.post("/coordinates", async (req, res) => {
  const route = req.body;
  let addressArr = [];
  let coordinates = [];
  try {
    // 🔹 Gọi sang student_service để lấy danh sách địa chỉ của tuyến
    const response = await callService(
      "student_service",
      `/students/route/${route.RouteID}/PickUpPoint`,
      "GET"
    );
  
    addressArr = response.addressArr || [];
    if (addressArr.length > 0) {
      // addressArr.push(route.EndLocation);
      
      try {
        // 🔹 Gọi sang location_service để chuyển địa chỉ thành tọa độ
        const coordinatesData = await callService(
          "location_service",
          "/api/locations/coordinates",
          "POST",
          addressArr
        );

        console.log('coordData: ',coordinatesData)
        coordinates = coordinatesData.coordinates || [];

        return res.status(200).json({
          message: "Tạo mảng tọa độ tuyến đường thành công",
          coordinates,
        });
      } catch (err) {
        console.error("Lỗi khi xử lý tọa độ:", err);
        return res.status(500).json({ message: "Lỗi khi chuyển đổi tọa độ" });
      }
    } else {
      return res.status(400).json({ message: "Không đủ địa chỉ để tạo tuyến đường" });
    }
  } catch (err) {
    console.error("Lỗi server student:", err);
    return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu student_service" });
  }
});

module.exports = router;
