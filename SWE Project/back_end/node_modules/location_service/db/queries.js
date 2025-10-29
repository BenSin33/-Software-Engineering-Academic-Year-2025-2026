const pool = require('./pool');

// ===================================
// BUS LOCATION TRACKING
// ===================================

// Get current location of all buses
async function getAllBusLocations() {
  const sql = `
    SELECT 
      bl.*
    FROM bus_locations bl
    WHERE bl.id IN (
      SELECT MAX(id) 
      FROM bus_locations 
      GROUP BY bus_id
    )
    ORDER BY bl.recorded_at DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

// Get current location of a specific bus
async function getBusLocation(bus_id) {
  const sql = `
    SELECT *
    FROM bus_locations
    WHERE bus_id = ?
    ORDER BY recorded_at DESC
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [bus_id]);
  return rows[0];
}

// Get location history of a bus
async function getBusLocationHistory(bus_id, start_date, end_date) {
  let sql = `
    SELECT * FROM bus_locations
    WHERE bus_id = ?
  `;
  const params = [bus_id];
  
  if (start_date && end_date) {
    sql += ` AND recorded_at BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  }
  
  sql += ` ORDER BY recorded_at DESC LIMIT 1000`;
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Add new location for a bus
async function addBusLocation(bus_id, latitude, longitude, speed, heading, altitude, accuracy, location_name) {
  const sql = `
    INSERT INTO bus_locations 
    (bus_id, latitude, longitude, speed, heading, altitude, accuracy, location_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [
    bus_id, latitude, longitude, speed || 0, heading || 0, 
    altitude || 0, accuracy || 0, location_name
  ]);
  return result.insertId;
}

// ===================================
// ROUTES
// ===================================

// Get all routes
async function getRoutes() {
  const sql = `
    SELECT 
      r.*,
      COUNT(DISTINCT rs.id) as stop_count
    FROM routes r
    LEFT JOIN route_stops rs ON r.id = rs.route_id
    GROUP BY r.id
    ORDER BY r.name
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

// Get route by ID
async function getRouteById(route_id) {
  const sql = `SELECT * FROM routes WHERE id = ?`;
  const [rows] = await pool.query(sql, [route_id]);
  return rows[0];
}

// Get route stops
async function getRouteStops(route_id) {
  const sql = `
    SELECT * FROM route_stops 
    WHERE route_id = ? 
    ORDER BY stop_order ASC
  `;
  const [rows] = await pool.query(sql, [route_id]);
  return rows;
}

// Add new route
async function addRoute(route_id, name, description, start_point, end_point, distance, estimated_duration) {
  const sql = `
    INSERT INTO routes 
    (id, name, description, start_point, end_point, distance, estimated_duration)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await pool.query(sql, [route_id, name, description, start_point, end_point, distance, estimated_duration]);
}

// Update route
async function updateRoute(route_id, name, description, start_point, end_point, distance, estimated_duration) {
  // Build dynamic update query based on provided fields
  const updates = [];
  const values = [];
  
  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (start_point !== undefined) {
    updates.push('start_point = ?');
    values.push(start_point);
  }
  if (end_point !== undefined) {
    updates.push('end_point = ?');
    values.push(end_point);
  }
  if (distance !== undefined) {
    updates.push('distance = ?');
    values.push(distance);
  }
  if (estimated_duration !== undefined) {
    updates.push('estimated_duration = ?');
    values.push(estimated_duration);
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(route_id);
  
  const sql = `UPDATE routes SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await pool.query(sql, values);
  
  if (result.affectedRows === 0) {
    throw new Error(`Route with id ${route_id} not found`);
  }
  
  return result;
}

// Delete route
async function deleteRoute(route_id) {
  const sql = `DELETE FROM routes WHERE id = ?`;
  await pool.query(sql, [route_id]);
}

// Add route stop
async function addRouteStop(route_id, stop_name, stop_order, latitude, longitude, address, arrival_time, departure_time, wait_time) {
  const sql = `
    INSERT INTO route_stops 
    (route_id, stop_name, stop_order, latitude, longitude, address, arrival_time, departure_time, wait_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [
    route_id, stop_name, stop_order, latitude, longitude, address, 
    arrival_time, departure_time, wait_time || 2
  ]);
  return result.insertId;
}

// Update route stop
async function updateRouteStop(stop_id, stop_name, stop_order, latitude, longitude, address, arrival_time, departure_time, wait_time) {
  const sql = `
    UPDATE route_stops 
    SET stop_name = ?, stop_order = ?, latitude = ?, longitude = ?, 
        address = ?, arrival_time = ?, departure_time = ?, wait_time = ?
    WHERE id = ?
  `;
  await pool.query(sql, [stop_name, stop_order, latitude, longitude, address, arrival_time, departure_time, wait_time, stop_id]);
}

// Delete route stop
async function deleteRouteStop(stop_id) {
  const sql = `DELETE FROM route_stops WHERE id = ?`;
  await pool.query(sql, [stop_id]);
}

// ===================================
// PICKUP/DROPOFF POINTS
// ===================================

// Get all pickup/dropoff points
async function getPickupDropoffPoints() {
  const sql = `SELECT * FROM pickup_dropoff_points ORDER BY point_name`;
  const [rows] = await pool.query(sql);
  return rows;
}

// Get pickup/dropoff point by ID
async function getPickupDropoffPointById(point_id) {
  const sql = `SELECT * FROM pickup_dropoff_points WHERE id = ?`;
  const [rows] = await pool.query(sql, [point_id]);
  return rows[0];
}

// Add new pickup/dropoff point
async function addPickupDropoffPoint(point_name, point_type, latitude, longitude, address, district) {
  const sql = `
    INSERT INTO pickup_dropoff_points 
    (point_name, point_type, latitude, longitude, address, district)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [point_name, point_type, latitude, longitude, address, district]);
  return result.insertId;
}

// Update pickup/dropoff point
async function updatePickupDropoffPoint(point_id, point_name, point_type, latitude, longitude, address, district) {
  const sql = `
    UPDATE pickup_dropoff_points 
    SET point_name = ?, point_type = ?, latitude = ?, longitude = ?, address = ?, district = ?
    WHERE id = ?
  `;
  await pool.query(sql, [point_name, point_type, latitude, longitude, address, district, point_id]);
}

// Delete pickup/dropoff point
async function deletePickupDropoffPoint(point_id) {
  const sql = `DELETE FROM pickup_dropoff_points WHERE id = ?`;
  await pool.query(sql, [point_id]);
}

// ===================================
// GEOFENCES
// ===================================

// Get all geofences
async function getGeofences() {
  const sql = `SELECT * FROM geofences ORDER BY name`;
  const [rows] = await pool.query(sql);
  return rows;
}

// Add new geofence
async function addGeofence(name, type, center_latitude, center_longitude, radius, description) {
  const sql = `
    INSERT INTO geofences 
    (name, type, center_latitude, center_longitude, radius, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [name, type, center_latitude, center_longitude, radius, description]);
  return result.insertId;
}

// Update geofence
async function updateGeofence(geofence_id, name, type, center_latitude, center_longitude, radius, description) {
  const sql = `
    UPDATE geofences 
    SET name = ?, type = ?, center_latitude = ?, center_longitude = ?, radius = ?, description = ?
    WHERE id = ?
  `;
  await pool.query(sql, [name, type, center_latitude, center_longitude, radius, description, geofence_id]);
}

// Delete geofence
async function deleteGeofence(geofence_id) {
  const sql = `DELETE FROM geofences WHERE id = ?`;
  await pool.query(sql, [geofence_id]);
}

// ===================================
// LOCATION ALERTS
// ===================================

// Get all location alerts
async function getLocationAlerts(is_resolved = null) {
  let sql = `
    SELECT 
      la.*
    FROM location_alerts la
  `;
  
  if (is_resolved !== null) {
    sql += ` WHERE la.is_resolved = ?`;
    const [rows] = await pool.query(sql, [is_resolved]);
    return rows;
  }
  
  sql += ` ORDER BY la.created_at DESC`;
  const [rows] = await pool.query(sql);
  return rows;
}

// Add new location alert
async function addLocationAlert(bus_id, alert_type, severity, message, latitude, longitude) {
  const sql = `
    INSERT INTO location_alerts 
    (bus_id, alert_type, severity, message, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [bus_id, alert_type, severity, message, latitude, longitude]);
  return result.insertId;
}

// Resolve alert
async function resolveAlert(alert_id) {
  const sql = `
    UPDATE location_alerts 
    SET is_resolved = TRUE, resolved_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  await pool.query(sql, [alert_id]);
}

// Delete alert
async function deleteAlert(alert_id) {
  const sql = `DELETE FROM location_alerts WHERE id = ?`;
  await pool.query(sql, [alert_id]);
}

// ===================================
// STATISTICS & ANALYTICS
// ===================================

// Get bus activity statistics by date
async function getBusActivityStats(bus_id, date) {
  const sql = `
    SELECT 
      COUNT(*) as total_records,
      AVG(speed) as avg_speed,
      MAX(speed) as max_speed,
      MIN(recorded_at) as first_record,
      MAX(recorded_at) as last_record,
      TIMESTAMPDIFF(MINUTE, MIN(recorded_at), MAX(recorded_at)) as total_minutes
    FROM bus_locations
    WHERE bus_id = ?
      AND DATE(recorded_at) = ?
  `;
  const [rows] = await pool.query(sql, [bus_id, date]);
  return rows[0];
}

// Find long stops (where bus stopped for extended time)
async function findLongStops(bus_id, min_minutes = 10) {
  const sql = `
    SELECT 
      location_name,
      latitude,
      longitude,
      MIN(recorded_at) as stop_start,
      MAX(recorded_at) as stop_end,
      TIMESTAMPDIFF(MINUTE, MIN(recorded_at), MAX(recorded_at)) as duration
    FROM bus_locations
    WHERE bus_id = ?
      AND speed = 0
    GROUP BY location_name, latitude, longitude
    HAVING duration >= ?
    ORDER BY stop_start DESC
  `;
  const [rows] = await pool.query(sql, [bus_id, min_minutes]);
  return rows;
}

// Get most used routes
async function getMostUsedRoutes() {
  const sql = `
    SELECT 
      r.id,
      r.name,
      COUNT(DISTINCT pp.id) as point_count
    FROM routes r
    LEFT JOIN pickup_dropoff_points pp ON 1=1
    WHERE r.status = 'active'
    GROUP BY r.id
    ORDER BY point_count DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

// ===================================
// EXPORTS
// ===================================

module.exports = {
  // Bus Location Tracking
  getAllBusLocations,
  getBusLocation,
  getBusLocationHistory,
  addBusLocation,
  
  // Routes
  getRoutes,
  getRouteById,
  getRouteStops,
  addRoute,
  updateRoute,
  deleteRoute,
  
  // Route Stops
  addRouteStop,
  updateRouteStop,
  deleteRouteStop,
  
  // Pickup/Dropoff Points
  getPickupDropoffPoints,
  getPickupDropoffPointById,
  addPickupDropoffPoint,
  updatePickupDropoffPoint,
  deletePickupDropoffPoint,
  
  // Geofences
  getGeofences,
  addGeofence,
  updateGeofence,
  deleteGeofence,
  
  // Location Alerts
  getLocationAlerts,
  addLocationAlert,
  resolveAlert,
  deleteAlert,
  
  // Statistics
  getBusActivityStats,
  findLongStops,
  getMostUsedRoutes
};