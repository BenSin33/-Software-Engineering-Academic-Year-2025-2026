const locationQueries = require('../db/locationQueries');
const eventPublisher = require('../events/eventPublisher');

// ===================================
// LOCATION TRACKING CONTROLLERS
// ===================================

async function getLocationTracking(req, res) {
  try {
    const busId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;

    const locations = await locationQueries.getLocationTracking(busId, limit);

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching location tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getLocationHistory(req, res) {
  try {
    const busId = req.params.id;
    const { startDate, endDate } = req.query;

    const locations = await locationQueries.getLocationHistory(busId, startDate, endDate);

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function addLocationTracking(req, res) {
  try {
    const busId = req.params.id;
    const locationData = {
      bus_id: busId,
      ...req.body
    };

    // Validation
    if (!locationData.latitude || !locationData.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude'
      });
    }

    await locationQueries.addLocationTracking(locationData);

    // Publish event (for real-time tracking)
    await eventPublisher.publish('bus.location_updated', {
      busId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      locationName: locationData.location_name,
      speed: locationData.speed,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Location recorded successfully'
    });
  } catch (error) {
    console.error('Error recording location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getCurrentLocations(req, res) {
  try {
    const locations = await locationQueries.getCurrentLocations();

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching current locations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getBusRoute(req, res) {
  try {
    const busId = req.params.id;
    const route = await locationQueries.getBusRoute(busId);

    res.json({
      success: true,
      data: route,
      count: route.length
    });
  } catch (error) {
    console.error('Error fetching bus route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getLocationStatistics(req, res) {
  try {
    const busId = req.params.id;
    const stats = await locationQueries.getLocationStatistics(busId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching location statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getLocationTracking,
  getLocationHistory,
  addLocationTracking,
  getCurrentLocations,
  getBusRoute,
  getLocationStatistics
};