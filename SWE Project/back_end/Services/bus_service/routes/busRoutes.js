const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

// Lấy thống kê xe buýt
router.get('/stats', busController.getBusStatistics);

// CRUD operations
router.get('/', busController.getAllBuses);
router.get('/:id', busController.getBusById);
router.post('/', busController.createBus);
router.put('/:id', busController.updateBus);
router.delete('/:id', busController.deleteBus);

// Assignment operations
router.put('/:id/driver', busController.updateBusDriver);
router.put('/:id/route', busController.updateBusRoute);

module.exports = router;