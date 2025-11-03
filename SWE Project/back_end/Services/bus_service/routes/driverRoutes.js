// bus_service/routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Driver CRUD + stats
router.get('/stats', driverController.getDriverStats);
router.get('/user/:userId', driverController.getDriverByUserId);
router.put('/:id/status', driverController.updateDriverStatus);
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

// Location endpoints (kept for tracking features)
router.get('/tracking/current', driverController.getCurrentLocations);
router.get('/:id/route', driverController.getBusRoute);
router.get('/:id/tracking', driverController.getLocationTracking);
router.get('/:id/history', driverController.getLocationHistory);
router.get('/:id/location-stats', driverController.getLocationStatistics);
router.post('/:id/tracking', driverController.addLocationTracking);

module.exports = router;