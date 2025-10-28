const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// ===================================
// BUS LOCATION TRACKING ROUTES
// ===================================

// Get all bus locations (latest position of each bus)
router.get('/bus-locations', locationController.getAllBusLocations);

// Get specific bus location
router.get('/bus-locations/:bus_id', locationController.getBusLocation);

// Get bus location history
router.get('/bus-locations/:bus_id/history', locationController.getBusLocationHistory);

// Add new bus location
router.post('/bus-locations/add', locationController.addBusLocation);

// ===================================
// ROUTES MANAGEMENT
// ===================================

// Get all routes
router.get('/routes', locationController.getAllRoutes);

// Get specific route
router.get('/routes/:route_id', locationController.getRouteById);

// Add new route
router.post('/routes/add', locationController.addNewRoute);

// Update route
router.put('/routes/update/:route_id', locationController.updateCurrentRoute);

// Delete route
router.delete('/routes/delete/:route_id', locationController.deleteRoute);

// ===================================
// ROUTE STOPS MANAGEMENT
// ===================================

// Get stops for a specific route
router.get('/routes/:route_id/stops', locationController.getRouteStops);

// Add stop to route
router.post('/routes/:route_id/stops/add', locationController.addRouteStop);

// Update route stop
router.put('/route-stops/update/:stop_id', locationController.updateRouteStop);

// Delete route stop
router.delete('/route-stops/delete/:stop_id', locationController.deleteRouteStop);

// ===================================
// PICKUP/DROPOFF POINTS MANAGEMENT
// ===================================

// Get all pickup/dropoff points
router.get('/pickup-dropoff-points', locationController.getAllPickupDropoffPoints);

// Get specific pickup/dropoff point
router.get('/pickup-dropoff-points/:point_id', locationController.getPickupDropoffPointById);

// Add new pickup/dropoff point
router.post('/pickup-dropoff-points/add', locationController.addPickupDropoffPoint);

// Update pickup/dropoff point
router.put('/pickup-dropoff-points/update/:point_id', locationController.updatePickupDropoffPoint);

// Delete pickup/dropoff point
router.delete('/pickup-dropoff-points/delete/:point_id', locationController.deletePickupDropoffPoint);

// ===================================
// GEOFENCES MANAGEMENT
// ===================================

// Get all geofences
router.get('/geofences', locationController.getAllGeofences);

// Add new geofence
router.post('/geofences/add', locationController.addGeofence);

// Update geofence
router.put('/geofences/update/:geofence_id', locationController.updateGeofence);

// Delete geofence
router.delete('/geofences/delete/:geofence_id', locationController.deleteGeofence);

// ===================================
// LOCATION ALERTS MANAGEMENT
// ===================================

// Get all alerts (with optional filter by is_resolved)
router.get('/alerts', locationController.getAllLocationAlerts);

// Add new alert
router.post('/alerts/add', locationController.addLocationAlert);

// Resolve alert
router.patch('/alerts/resolve/:alert_id', locationController.resolveAlert);

// Delete alert
router.delete('/alerts/delete/:alert_id', locationController.deleteAlert);

module.exports = router;