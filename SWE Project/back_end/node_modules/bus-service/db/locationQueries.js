const pool = require('./pool');

// ===================================
// LOCATION TRACKING OPERATIONS
// ===================================

async function getLocationTracking(busId, limit = 50) {
  const [locations] = await pool.query(
    `SELECT * FROM bus_location_tracking 
     WHERE bus_id = ? 
     ORDER BY recorded_at DESC 
     LIMIT ?`,
    [busId, limit]
  );
  return locations;
}

async function getLocationHistory(busId, startDate, endDate) {
  let query = `
    SELECT * FROM bus_location_tracking 
    WHERE bus_id = ?
  `;
  const params = [busId];

  if (startDate && endDate) {
    query += ' AND recorded_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  query += ' ORDER BY recorded_at DESC';

  const [locations] = await pool.query(query, params);
  return locations;
}

async function addLocationTracking(locationData) {
  const {
    bus_id,
    latitude,
    longitude,
    location_name,
    speed
  } = locationData;

  const [result] = await pool.query(
    `INSERT INTO bus_location_tracking (bus_id, latitude, longitude, location_name, speed)
     VALUES (?, ?, ?, ?, ?)`,
    [bus_id, latitude, longitude, location_name, speed]
  );

  // Update current location in buses table
  await pool.query(
    'UPDATE buses SET location = ?, speed = ? WHERE id = ?',
    [location_name, speed, bus_id]
  );

  return result;
}

async function getCurrentLocations() {
  const [locations] = await pool.query(`
    SELECT 
      blt.*,
      b.license_plate,
      b.model,
      b.status,
      b.route_id,
      b.driver_name
    FROM bus_location_tracking blt
    INNER JOIN buses b ON blt.bus_id = b.id
    WHERE blt.id IN (
      SELECT MAX(id)
      FROM bus_location_tracking
      GROUP BY bus_id
    )
    ORDER BY blt.recorded_at DESC
  `);
  return locations;
}

async function getBusRoute(busId) {
  const [route] = await pool.query(`
    SELECT 
      bus_id,
      latitude,
      longitude,
      location_name,
      speed,
      recorded_at
    FROM bus_location_tracking
    WHERE bus_id = ?
      AND DATE(recorded_at) = CURRENT_DATE
    ORDER BY recorded_at ASC
  `, [busId]);
  return route;
}

async function getLocationStatistics(busId) {
  const [stats] = await pool.query(`
    SELECT 
      COUNT(*) as totalRecords,
      AVG(speed) as avgSpeed,
      MAX(speed) as maxSpeed,
      MIN(recorded_at) as firstRecord,
      MAX(recorded_at) as lastRecord
    FROM bus_location_tracking
    WHERE bus_id = ?
      AND DATE(recorded_at) = CURRENT_DATE
  `, [busId]);
  return stats[0];
}

module.exports = {
  getLocationTracking,
  getLocationHistory,
  addLocationTracking,
  getCurrentLocations,
  getBusRoute,
  getLocationStatistics
};