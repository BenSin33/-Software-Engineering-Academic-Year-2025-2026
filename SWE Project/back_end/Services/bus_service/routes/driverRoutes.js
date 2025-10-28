// bus_service/routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Lấy thống kê tài xế
router.get('/stats', driverController.getDriverStats);

// Lấy tài xế theo UserID
router.get('/user/:userId', driverController.getDriverByUserId);

// Cập nhật trạng thái tài xế
router.put('/:id/status', driverController.updateDriverStatus);

// CRUD operations
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;