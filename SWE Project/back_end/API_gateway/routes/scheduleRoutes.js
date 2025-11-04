const express = require("express");
const { callService } = require("../services/callService.js");

const router = express.Router();
const {scheduleController, getScheduleData}= require('../controllers/scheduleController.js')
// GET /api/schedule
router.get('/',scheduleController );

router.post("/add", async (req, res) => {
  try {
    const { RouteID, StartTime, EndTime, Date } = req.body;
    const formData = { RouteID, StartTime, EndTime, Date };
    console.log('nuoc nong: ')
    // 🟢 1. Gọi schedule_service để thêm lịch trình
    const scheduleData = await callService(
      "schedule_service",
      "/Schedules/add",
      "POST",
      formData
    );
    
    // 🟢 2. Lấy thông tin Route + Driver theo RouteID
    const routeDriverMergedData = await getScheduleData(RouteID);

    // 🟢 3. Gộp tất cả dữ liệu lại thành một record hoàn chỉnh
    const mergedData = {
      ...scheduleData,
      ...routeDriverMergedData,
    };

    // 🟢 4. Gửi về frontend
    res.status(201).json({
      message: "Thêm lịch trình thành công",
      data: mergedData,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm lịch trình:", err.message);
    res.status(500).json({ message: "Không thể thêm lịch trình" });
  }
});

module.exports = router;
