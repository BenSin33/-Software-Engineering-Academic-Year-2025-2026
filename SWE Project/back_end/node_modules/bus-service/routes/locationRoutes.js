const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { validateLocationTracking } = require('../middleware/validation');

// ===================================
// LOCATION TRACKING ROUTES
// ===================================

// Get current locations of all buses
router.get('/current', locationController.getCurrentLocations);

// Get location tracking for specific bus
router.get('/bus/:id', locationController.getLocationTracking);

// Get location history for specific bus
router.get('/bus/:id/history', locationController.getLocationHistory);

// Get today's route for specific bus
router.get('/bus/:id/route', locationController.getBusRoute);

// Get location statistics for specific bus
router.get('/bus/:id/stats', locationController.getLocationStatistics);

// Add location tracking (GPS update) - with validation
router.post('/bus/:id', validateLocationTracking, locationController.addLocationTracking);

module.exports = router;