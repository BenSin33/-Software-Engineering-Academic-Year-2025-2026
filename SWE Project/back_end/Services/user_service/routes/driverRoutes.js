const express = require('express');
const controller = require('../controllers/driverController');
const authorize = require('../middleware/auth.middleware');

const router = express.Router();

// Admin (R001) có thể xem thống kê tài xế
router.get("/drivers/stats", authorize(["R001"]), controller.getDriverStats);

// Chỉ cho phép tài xế (R002) xem thông tin của chính họ
router.get("/drivers/user/:userId", authorize(["R002"]), controller.getDriverByUserId);

// Chỉ cho phép tài xế (R002) cập nhật thông tin của chính họ
router.put("/drivers/user/:userId", authorize(["R002"]), controller.updateDriver);

// Admin (R001) có thể xem tất cả tài xế
router.get("/drivers", authorize(["R001"]), controller.getAllDrivers);

// CRUD routes cho Admin
router.post('/drivers', authorize(["R001"]), controller.createDriver);
router.get('/drivers/:id', authorize(["R001"]), controller.getDriverById);
router.put('/drivers/:id', authorize(["R001"]), controller.updateDriver);
router.delete('/drivers/:id', authorize(["R001"]), controller.deleteDriver);

module.exports = router;
