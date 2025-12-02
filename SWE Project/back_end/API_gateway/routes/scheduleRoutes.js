const express = require("express");
const router = express.Router();
const { callService } = require("../services/callService.js");

// Controller cho các hàm logic phức tạp
const scheduleController = require('../controllers/scheduleController.js');

// Middleware xác thực
const authMiddleware = require('../middleware/auth.middleware.js'); 

// ==========================================
// 1. API CHO TÀI XẾ (Driver App)
// ==========================================
router.get('/driver/my-schedules', authMiddleware.verifyToken, scheduleController.getMySchedules);


// ==========================================
// 2. API CHO ADMIN (Web Dashboard)
// ==========================================

// GET: Lấy danh sách
router.get('/', scheduleController.getAllSchedules);

// POST: Thêm mới (Đã tối ưu hóa)
router.post("/add", async (req, res) => {
  try {
    const { RouteID, StartTime, EndTime, Date, DriverID } = req.body;

    // 1. Gọi hàm lấy thông tin Route MỘT LẦN DUY NHẤT
    // Hàm này sẽ trả về cả: driverID, busID (nếu controller gateway đã sửa đúng)
    const routeInfo = await scheduleController.getScheduleData(RouteID);

    // 2. Logic điền tự động (Auto-fill)
    const finalBusID = routeInfo.busID || 'BUS-01'; // Lấy bus từ route, fallback BUS-01
    const finalDriverID = DriverID || routeInfo.driverID || 'D001'; // Ưu tiên FE gửi -> Route -> Fallback

    // 3. Gọi Service con
    const scheduleData = await callService(
      "schedule_service", 
      "/Schedules/add", 
      "POST", 
      { 
        RouteID,
        DriverID: finalDriverID,
        BusID: finalBusID, // ✅ Đã gửi BusID sang service con
        StartTime,
        EndTime,
        Date 
      }
    );
    
    // 4. Trả về kết quả
    res.status(201).json({
      message: "Thêm lịch trình thành công",
      data: scheduleData
    });

  } catch (err) {
    console.error("❌ Gateway Add Error:", err.message);
    res.status(500).json({ message: "Không thể thêm lịch trình" });
  }
});

// PUT: Cập nhật
router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { RouteID, StartTime, EndTime, Date } = req.body;
    
    const scheduleData = await callService(
      "schedule_service", 
      `/Schedules/edit/${id}`, 
      "PUT", 
      { RouteID, StartTime, EndTime, Date }
    );

    const enrichedData = await scheduleController.getScheduleData(RouteID);

    res.status(200).json({
      message: "Cập nhật thành công",
      data: { ...scheduleData, ...enrichedData }
    });
  } catch (error) {
    console.error("❌ Gateway Edit Error:", error);
    res.status(400).json({ message: "Lỗi cập nhật" });
  }
});

// DELETE: Xóa
router.delete('/delete/:id', async (req, res) => {
  try {
     const { id } = req.params;
     await callService("schedule_service", `/Schedules/delete/${id}`, "DELETE");
     res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    console.error("❌ Gateway Delete Error:", error);
    res.status(400).json({ message: 'Không thể xóa' });
  }
});

router.patch("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await callService(
      "schedule_service", 
      `/Schedules/status/${id}`, 
      "PATCH", 
      { status }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái Gateway" });
  }
});

module.exports = router;