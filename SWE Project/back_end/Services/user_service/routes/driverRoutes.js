const express = require('express');
const controller = require('../controllers/driverController');
const authorize = require('../middleware/auth.middleware');

const router = express.Router();

// Admin (R001) có thể xem thống kê tài xế
router.get("/stats", controller.getDriverStats);
// Lấy các tài xế chưa được gán RouteID (RouteID = NULL)

router.get('/no-route', controller.getDriversWithoutRoute);
// Chỉ cho phép tài xế (R002) xem thông tin của chính họ

router.get("/user/:userId", controller.getDriverByUserId);

// Chỉ cho phép tài xế (R002) cập nhật thông tin của chính họ
router.put("/user/:userId", controller.updateDriver);

// Admin (R001) có thể xem tất cả tài xế
router.get("/", controller.getAllDrivers);
// update driver from route page

// CRUD routes cho Admin
router.post('/', controller.createDriverWithAccount);
router.get('/:id', controller.getDriverById);
router.put('/:id', controller.updateDriver);
router.delete('/:id', controller.deleteDriver);

module.exports = router;
