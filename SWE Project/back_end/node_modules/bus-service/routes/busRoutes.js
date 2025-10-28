const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { validateBusCreation, validateBusUpdate } = require('../middleware/validation');

// ===================================
// BUS ROUTES
// ===================================

// Get all buses with filters
router.get('/', busController.getAllBuses);

// Get bus statistics
router.get('/stats/summary', busController.getBusStatistics);

// Get buses needing maintenance
router.get('/maintenance/needed', busController.getBusesNeedingMaintenance);

// Get available buses
router.get('/available', busController.getAvailableBuses);

// Get buses by route
router.get('/route/:routeId', busController.getBusesByRoute);

// Get single bus by ID
router.get('/:id', busController.getBusById);

// Get bus events
router.get('/:id/events', busController.getBusEvents);

// Create new bus (with validation)
router.post('/', validateBusCreation, busController.createBus);

// Update bus (with validation)
router.put('/:id', validateBusUpdate, busController.updateBus);

// Update bus status
router.patch('/:id/status', busController.updateBusStatus);

// Delete bus
router.delete('/:id', busController.deleteBus);

module.exports = router;