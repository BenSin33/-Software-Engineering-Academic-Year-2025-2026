const { Router } = require('express');
const mapController = require('../controllers/mapController');
const mapRouter = Router();

// ===================================
// MAP & ROUTING ROUTES
// ===================================

// Get map configuration
mapRouter.get('/config', mapController.getMapConfig);

// Calculate route between 2 points
mapRouter.post('/route', mapController.calculateRoute);

// Calculate route through multiple waypoints
mapRouter.post('/route/multi-point', mapController.calculateMultiPointRoute);

// Calculate distance matrix
mapRouter.post('/distance-matrix', mapController.calculateDistanceMatrix);

// Optimize route (TSP)
mapRouter.post('/route/optimize', mapController.optimizeRoute);

// Geocoding - address to coordinates
mapRouter.get('/geocode', mapController.geocodeAddress);

// Reverse geocoding - coordinates to address
mapRouter.get('/reverse-geocode', mapController.reverseGeocode);

// Calculate isochrone (reachable area)
mapRouter.post('/isochrone', mapController.calculateIsochrone);

module.exports = mapRouter;