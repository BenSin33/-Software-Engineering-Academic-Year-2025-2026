
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Thống kê
// router.get('/stats', locationController.getLocationStats);
//đổi địa chỉ sang tọa độ
router.post('/coordinates',locationController.getCoordinatesArray);
// Lấy vị trí hiện tại
// router.get('/', locationController.getAllCurrentLocations);
// router.get('/bus/:busId', locationController.getBusLocation);
// router.get('/route/:routeId', locationController.getLocationsByRoute);

// // Lịch sử vị trí
// router.get('/history/:busId', locationController.getLocationHistory);

// // Cập nhật vị trí (realtime)
// router.post('/update/:busId', locationController.updateLocation);

// // Xóa tracking
// router.delete('/tracking/:busId', locationController.deleteTracking);

// 1. Driver gửi tọa độ (POST)
// URL: /Location/update/:scheduleId
router.post('/update/:scheduleId', locationController.updateLocation);

// 2. Admin lấy tọa độ mới nhất (GET)
// URL: /Location/latest/:scheduleId
router.get('/latest/:scheduleId', locationController.getLatestLocation);

module.exports = router;