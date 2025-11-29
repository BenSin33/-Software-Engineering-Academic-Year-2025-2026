const express = require("express");
const router = express.Router();
const { callService } = require("../services/callService.js");

// Controller cho các hàm logic phức tạp (như Driver xem lịch)
const scheduleController = require('../controllers/scheduleController.js');

// Middleware xác thực (Dành cho route cần bảo mật như Driver)
const authMiddleware = require('../middleware/auth.middleware.js'); 

// ==========================================
// 1. API CHO TÀI XẾ (Driver App)
// ==========================================
// GET http://localhost:5000/Schedules/driver/my-schedules
router.get('/driver/my-schedules', authMiddleware.verifyToken, scheduleController.getMySchedules);


// ==========================================
// 2. API CHO ADMIN (Web Dashboard)
// ==========================================

// GET: Lấy danh sách (Admin xem tất cả)
router.get('/', scheduleController.getAllSchedules);

// POST: Thêm mới (Gọi service schedule_service)
router.post("/add", async (req, res) => {
  try {
    const { RouteID, StartTime, EndTime, Date } = req.body;
    
    // 1. TỰ ĐỘNG LẤY DRIVER TỪ ROUTE ID
    // Gọi hàm helper để tra cứu thông tin tuyến đường
    const routeInfo = await scheduleController.getScheduleData(RouteID);
    
    // Lấy DriverID tìm được (hoặc BusID nếu cần)
    const autoDriverID = routeInfo.driverID;

    // Kiểm tra: Nếu tuyến đường chưa được gán tài xế thì báo lỗi hoặc dùng tài xế mặc định để test
    // Ví dụ: Nếu không tìm thấy, gán tạm 'D001' (chỉ dùng khi dev) hoặc báo lỗi
    const finalDriverID = autoDriverID || 'D001'; 
    
    if (!autoDriverID) {
       console.warn(`⚠️ Cảnh báo: Route ${RouteID} chưa có tài xế. Đang dùng tài xế mặc định: ${finalDriverID}`);
    }

    // 2. Gọi schedule_service để lưu (Kèm theo DriverID vừa tìm được)
    const scheduleData = await callService(
      "schedule_service", 
      "/Schedules/add", 
      "POST", 
      { 
        RouteID, 
        DriverID: finalDriverID, // 👈 Đã bổ sung DriverID
        StartTime, 
        EndTime, 
        Date 
      }
    );
    
    // 3. Trả về kết quả
    // (routeInfo đã có sẵn driverName/routeName, dùng luôn không cần gọi lại)
    res.status(201).json({
      message: "Thêm lịch trình thành công",
      data: { ...scheduleData, ...routeInfo }
    });

  } catch (err) {
    console.error("❌ Gateway Add Error:", err.message);
    res.status(500).json({ message: "Không thể thêm lịch trình: " + err.message });
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

module.exports = router;