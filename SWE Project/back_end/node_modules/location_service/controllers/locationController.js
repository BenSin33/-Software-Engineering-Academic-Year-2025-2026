const queries = require('../db/queries');

// ===================================
// BUS LOCATION TRACKING CONTROLLERS
// ===================================

// Get all bus locations (latest position of each bus)
async function getAllBusLocations(req, res) {
  try {
    const locations = await queries.getAllBusLocations();
    res.json({
      success: true,
      message: 'Retrieved all bus locations successfully',
      data: locations
    });
  } catch (error) {
    console.error('Error getting bus locations:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Get specific bus location
async function getBusLocation(req, res) {
  try {
    const { bus_id } = req.params;
    const location = await queries.getBusLocation(bus_id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Bus with ID ${bus_id} not found`
      });
    }
    
    res.json({
      success: true,
      message: 'Retrieved bus location successfully',
      data: location
    });
  } catch (error) {
    console.error('Error getting bus location:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Get bus location history
async function getBusLocationHistory(req, res) {
  try {
    const { bus_id } = req.params;
    const { start_date, end_date } = req.query;
    
    const history = await queries.getBusLocationHistory(bus_id, start_date, end_date);
    
    res.json({
      success: true,
      message: 'Retrieved bus location history successfully',
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error getting bus location history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Add new bus location
async function addBusLocation(req, res) {
  try {
    const { 
      bus_id, 
      latitude, 
      longitude, 
      speed, 
      heading, 
      altitude, 
      accuracy, 
      location_name 
    } = req.body;

    // Validate required fields
    if (!bus_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bus_id, latitude, longitude'
      });
    }

    // Validate data types
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude must be valid numbers'
      });
    }

    // Add location to database
    const location_id = await queries.addBusLocation(
      bus_id, 
      parseFloat(latitude), 
      parseFloat(longitude), 
      parseInt(speed) || 0, 
      parseInt(heading) || 0, 
      parseInt(altitude) || 0, 
      parseInt(accuracy) || 0, 
      location_name || null
    );

    res.status(201).json({
      success: true,
      message: 'Location added successfully',
      data: {
        location_id,
        bus_id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: parseInt(speed) || 0,
        heading: parseInt(heading) || 0,
        location_name
      }
    });
  } catch (error) {
    console.error('Error adding bus location:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ===================================
// ROUTES CONTROLLERS
// ===================================

// Get all routes
async function getAllRoutes(req, res) {
  try {
    const routes = await queries.getRoutes();
    res.json({
      success: true,
      message: 'Retrieved all routes successfully',
      data: routes
    });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Get route by ID
async function getRouteById(req, res) {
  try {
    const { route_id } = req.params;
    const route = await queries.getRouteById(route_id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: `Route with ID ${route_id} not found`
      });
    }
    
    res.json({
      success: true,
      message: 'Retrieved route successfully',
      data: route
    });
  } catch (error) {
    console.error('Error getting route:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Add new route
async function addNewRoute(req, res) {
  try {
    const { 
      route_id, 
      name, 
      description, 
      start_point, 
      end_point, 
      distance, 
      estimated_duration 
    } = req.body;

    // Validate required fields
    if (!route_id || !name || !start_point || !end_point) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: route_id, name, start_point, end_point'
      });
    }

    await queries.addRoute(
      route_id, 
      name, 
      description, 
      start_point, 
      end_point, 
      parseFloat(distance) || 0, 
      parseInt(estimated_duration) || 0
    );

    res.status(201).json({
      success: true,
      message: 'Route added successfully',
      data: {
        route_id,
        name,
        start_point,
        end_point
      }
    });
  } catch (error) {
    console.error('Error adding route:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Update route
async function updateCurrentRoute(req, res) {
  try {
    const { route_id } = req.params;
    const { 
      name, 
      description, 
      start_point, 
      end_point, 
      distance, 
      estimated_duration 
    } = req.body;

    await queries.updateRoute(
      route_id,
      name, 
      description, 
      start_point, 
      end_point, 
      parseFloat(distance), 
      parseInt(estimated_duration)
    );

    res.json({
      success: true,
      message: 'Route updated successfully'
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Delete route
async function deleteRoute(req, res) {
  try {
    const { route_id } = req.params;
    await queries.deleteRoute(route_id);
    
    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ===================================
// ROUTE STOPS CONTROLLERS
// ===================================

// Get route stops
async function getRouteStops(req, res) {
  try {
    const { route_id } = req.params;
    const stops = await queries.getRouteStops(route_id);
    
    res.json({
      success: true,
      message: 'Retrieved route stops successfully',
      data: stops
    });
  } catch (error) {
    console.error('Error getting route stops:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Add route stop
async function addRouteStop(req, res) {
  try {
    const { route_id } = req.params;
    const { 
      stop_name, 
      stop_order, 
      latitude, 
      longitude, 
      address, 
      arrival_time, 
      departure_time, 
      wait_time 
    } = req.body;

    // Validate required fields
    if (!stop_name || !stop_order || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: stop_name, stop_order, latitude, longitude'
      });
    }

    const stop_id = await queries.addRouteStop(
      route_id,
      stop_name,
      parseInt(stop_order),
      parseFloat(latitude),
      parseFloat(longitude),
      address,
      arrival_time,
      departure_time,
      parseInt(wait_time) || 2
    );

    res.status(201).json({
      success: true,
      message: 'Stop added successfully',
      data: {
        stop_id,
        route_id,
        stop_name,
        stop_order
      }
    });
  } catch (error) {
    console.error('Error adding route stop:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Update route stop
async function updateRouteStop(req, res) {
  try {
    const { stop_id } = req.params;
    const { 
      stop_name, 
      stop_order, 
      latitude, 
      longitude, 
      address, 
      arrival_time, 
      departure_time, 
      wait_time 
    } = req.body;

    await queries.updateRouteStop(
      stop_id,
      stop_name,
      parseInt(stop_order),
      parseFloat(latitude),
      parseFloat(longitude),
      address,
      arrival_time,
      departure_time,
      parseInt(wait_time)
    );

    res.json({
      success: true,
      message: 'Stop updated successfully'
    });
  } catch (error) {
    console.error('Error updating route stop:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Delete route stop
async function deleteRouteStop(req, res) {
  try {
    const { stop_id } = req.params;
    await queries.deleteRouteStop(stop_id);
    
    res.json({
      success: true,
      message: 'Stop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route stop:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ===================================
// PICKUP/DROPOFF POINTS CONTROLLERS
// ===================================

// Get all pickup/dropoff points
async function getAllPickupDropoffPoints(req, res) {
  try {
    const points = await queries.getPickupDropoffPoints();
    res.json({
      success: true,
      message: 'Retrieved all pickup/dropoff points successfully',
      data: points
    });
  } catch (error) {
    console.error('Error getting pickup/dropoff points:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Get pickup/dropoff point by ID
async function getPickupDropoffPointById(req, res) {
  try {
    const { point_id } = req.params;
    const point = await queries.getPickupDropoffPointById(point_id);
    
    if (!point) {
      return res.status(404).json({
        success: false,
        message: `Point with ID ${point_id} not found`
      });
    }
    
    res.json({
      success: true,
      message: 'Retrieved point successfully',
      data: point
    });
  } catch (error) {
    console.error('Error getting pickup/dropoff point:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Add pickup/dropoff point
async function addPickupDropoffPoint(req, res) {
  try {
    const { 
      point_name, 
      point_type, 
      latitude, 
      longitude, 
      address, 
      district 
    } = req.body;

    // Validate required fields
    if (!point_name || !point_type || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: point_name, point_type, latitude, longitude'
      });
    }

    // Validate point_type
    const valid_types = ['pickup', 'dropoff', 'both'];
    if (!valid_types.includes(point_type)) {
      return res.status(400).json({
        success: false,
        message: 'point_type must be one of: pickup, dropoff, both'
      });
    }

    const point_id = await queries.addPickupDropoffPoint(
      point_name,
      point_type,
      parseFloat(latitude),
      parseFloat(longitude),
      address,
      district
    );

    res.status(201).json({
      success: true,
      message: 'Point added successfully',
      data: {
        point_id,
        point_name,
        point_type,
        latitude,
        longitude
      }
    });
  } catch (error) {
    console.error('Error adding pickup/dropoff point:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Update pickup/dropoff point
async function updatePickupDropoffPoint(req, res) {
  try {
    const { point_id } = req.params;
    const { 
      point_name, 
      point_type, 
      latitude, 
      longitude, 
      address, 
      district 
    } = req.body;

    await queries.updatePickupDropoffPoint(
      point_id,
      point_name,
      point_type,
      parseFloat(latitude),
      parseFloat(longitude),
      address,
      district
    );

    res.json({
      success: true,
      message: 'Point updated successfully'
    });
  } catch (error) {
    console.error('Error updating pickup/dropoff point:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Delete pickup/dropoff point
async function deletePickupDropoffPoint(req, res) {
  try {
    const { point_id } = req.params;
    await queries.deletePickupDropoffPoint(point_id);
    
    res.json({
      success: true,
      message: 'Point deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pickup/dropoff point:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ===================================
// GEOFENCES CONTROLLERS
// ===================================

// Get all geofences
async function getAllGeofences(req, res) {
  try {
    const geofences = await queries.getGeofences();
    res.json({
      success: true,
      message: 'Retrieved all geofences successfully',
      data: geofences
    });
  } catch (error) {
    console.error('Error getting geofences:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Add geofence
async function addGeofence(req, res) {
  try {
    const { 
      name, 
      type, 
      center_latitude, 
      center_longitude, 
      radius, 
      description 
    } = req.body;

    // Validate required fields
    if (!name || !type || center_latitude === undefined || center_longitude === undefined || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, type, center_latitude, center_longitude, radius'
      });
    }

    // Validate type
    const valid_types = ['school', 'pickup_point', 'danger_zone', 'service_area'];
    if (!valid_types.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be one of: school, pickup_point, danger_zone, service_area'
      });
    }

    const geofence_id = await queries.addGeofence(
      name,
      type,
      parseFloat(center_latitude),
      parseFloat(center_longitude),
      parseInt(radius),
      description
    );

    res.status(201).json({
      success: true,
      message: 'Geofence added successfully',
      data: {
        geofence_id,
        name,
        type,
        radius
      }
    });
  } catch (error) {
    console.error('Error adding geofence:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Update geofence
async function updateGeofence(req, res) {
  try {
    const { geofence_id } = req.params;
    const { 
      name, 
      type, 
      center_latitude, 
      center_longitude, 
      radius, 
      description 
    } = req.body;

    await queries.updateGeofence(
      geofence_id,
      name,
      type,
      parseFloat(center_latitude),
      parseFloat(center_longitude),
      parseInt(radius),
      description
    );

    res.json({
      success: true,
      message: 'Geofence updated successfully'
    });
  } catch (error) {
    console.error('Error updating geofence:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Delete geofence
async function deleteGeofence(req, res) {
  try {
    const { geofence_id } = req.params;
    await queries.deleteGeofence(geofence_id);
    
    res.json({
      success: true,
      message: 'Geofence deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting geofence:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ===================================
// LOCATION ALERTS CONTROLLERS
// ===================================

// Get all location alerts
async function getAllLocationAlerts(req, res) {
  try {
    const { is_resolved } = req.query;
    const resolved_filter = is_resolved !== undefined ? is_resolved === 'true' : null;
    
    const alerts = await queries.getLocationAlerts(resolved_filter);
    
    res.json({
      success: true,
      message: 'Retrieved location alerts successfully',
      data: alerts
    });
  } catch (error) {
    console.error('Error getting location alerts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Add location alert
async function addLocationAlert(req, res) {
  try {
    const { 
      bus_id, 
      alert_type, 
      severity, 
      message, 
      latitude, 
      longitude 
    } = req.body;

    // Validate required fields
    if (!bus_id || !alert_type || !severity || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bus_id, alert_type, severity, message'
      });
    }

    // Validate alert_type
    const valid_alert_types = ['speeding', 'route_deviation', 'geofence_entry', 'geofence_exit', 'stopped_too_long'];
    if (!valid_alert_types.includes(alert_type)) {
      return res.status(400).json({
        success: false,
        message: 'alert_type must be one of: speeding, route_deviation, geofence_entry, geofence_exit, stopped_too_long'
      });
    }

    // Validate severity
    const valid_severities = ['low', 'medium', 'high', 'critical'];
    if (!valid_severities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'severity must be one of: low, medium, high, critical'
      });
    }

    const alert_id = await queries.addLocationAlert(
      bus_id,
      alert_type,
      severity,
      message,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null
    );

    res.status(201).json({
      success: true,
      message: 'Alert added successfully',
      data: {
        alert_id,
        bus_id,
        alert_type,
        severity
      }
    });
  } catch (error) {
    console.error('Error adding location alert:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Resolve alert
async function resolveAlert(req, res) {
  try {
    const { alert_id } = req.params;
    await queries.resolveAlert(alert_id);
    
    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Delete alert
async function deleteAlert(req, res) {
  try {
    const { alert_id } = req.params;
    await queries.deleteAlert(alert_id);
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  // Bus Location Tracking
  getAllBusLocations,
  getBusLocation,
  getBusLocationHistory,
  addBusLocation,
  
  // Routes
  getAllRoutes,
  getRouteById,
  addNewRoute,
  updateCurrentRoute,
  deleteRoute,
  
  // Route Stops
  getRouteStops,
  addRouteStop,
  updateRouteStop,
  deleteRouteStop,
  
  // Pickup/Dropoff Points
  getAllPickupDropoffPoints,
  getPickupDropoffPointById,
  addPickupDropoffPoint,
  updatePickupDropoffPoint,
  deletePickupDropoffPoint,
  
  // Geofences
  getAllGeofences,
  addGeofence,
  updateGeofence,
  deleteGeofence,
  
  // Location Alerts
  getAllLocationAlerts,
  addLocationAlert,
  resolveAlert,
  deleteAlert
};