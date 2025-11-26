
const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Route calculation
router.get('/route', mapController.calculateRoute);
router.post('/route/optimize', mapController.optimizeRoute);

// Geocoding
router.get('/geocode', mapController.geocodeAddress);
router.get('/reverse-geocode', mapController.reverseGeocode);

// Distance calculation
router.post('/distance', mapController.calculateDistance);

// Geofence check
router.get('/geofence/check', mapController.checkGeofence);

// Map tiles
router.get('/tiles', mapController.getMapTileUrl);

module.exports = router;