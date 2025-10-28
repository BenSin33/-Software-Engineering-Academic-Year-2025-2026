const pool = require('./pool');

// ===================================
// BUS CRUD OPERATIONS
// ===================================

async function getAllBuses(filters = {}) {
  const { 
    status, 
    search, 
    minCapacity, 
    maxCapacity, 
    minFuel, 
    year, 
    route,
    sortBy = 'id',
    sortOrder = 'asc',
    page = 1,
    limit = 10
  } = filters;

  let query = 'SELECT * FROM buses WHERE 1=1';
  const params = [];

  // Apply filters
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (id LIKE ? OR license_plate LIKE ? OR model LIKE ? OR driver_name LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  if (minCapacity) {
    query += ' AND capacity >= ?';
    params.push(parseInt(minCapacity));
  }

  if (maxCapacity) {
    query += ' AND capacity <= ?';
    params.push(parseInt(maxCapacity));
  }

  if (minFuel) {
    query += ' AND fuel_level >= ?';
    params.push(parseInt(minFuel));
  }

  if (year) {
    query += ' AND year = ?';
    params.push(parseInt(year));
  }

  if (route) {
    query += ' AND route_id LIKE ?';
    params.push(`%${route}%`);
  }

  // Sorting
  const validSortFields = ['id', 'license_plate', 'status', 'capacity', 'fuel_level', 'distance', 'created_at'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'id';
  const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortField} ${order}`;

  // Get total count
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const [countResult] = await pool.query(countQuery, params);
  const total = countResult[0].total;

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const [buses] = await pool.query(query, params);

  return {
    buses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
}

async function getBusById(busId) {
  const [buses] = await pool.query(
    'SELECT * FROM buses WHERE id = ?',
    [busId]
  );
  return buses[0];
}

async function getBusStatistics() {
  const [stats] = await pool.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
      SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting,
      SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
      SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
      SUM(capacity) as totalCapacity,
      SUM(current_load) as registered,
      AVG(fuel_level) as avgFuelLevel,
      SUM(CASE WHEN fuel_level < 30 THEN 1 ELSE 0 END) as lowFuel,
      SUM(CASE WHEN distance > 150000 THEN 1 ELSE 0 END) as highMileage
    FROM buses
  `);
  return stats[0];
}

async function createBus(busData) {
  const {
    id,
    license_plate,
    model,
    year,
    status = 'ready',
    capacity,
    current_load = 0,
    fuel_level = 100,
    driver_name,
    route_id,
    speed = 0,
    distance = 0,
    location,
    last_maintenance
  } = busData;

  const [result] = await pool.query(
    `INSERT INTO buses (
      id, license_plate, model, year, status, capacity, 
      current_load, fuel_level, driver_name, route_id, 
      speed, distance, location, last_maintenance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, license_plate, model, year, status, capacity,
      current_load, fuel_level, driver_name, route_id,
      speed, distance, location, last_maintenance
    ]
  );

  return result;
}

async function updateBus(busId, updateData) {
  const fields = Object.keys(updateData).filter(key => key !== 'id');
  const values = fields.map(key => updateData[key]);
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  values.push(busId);

  const [result] = await pool.query(
    `UPDATE buses SET ${setClause} WHERE id = ?`,
    values
  );

  return result;
}

async function updateBusStatus(busId, newStatus) {
  const [result] = await pool.query(
    'UPDATE buses SET status = ? WHERE id = ?',
    [newStatus, busId]
  );
  return result;
}

async function deleteBus(busId) {
  const [result] = await pool.query(
    'DELETE FROM buses WHERE id = ?',
    [busId]
  );
  return result;
}

// ===================================
// BUS EVENTS
// ===================================

async function logBusEvent(busId, eventType, eventData) {
  const [result] = await pool.query(
    'INSERT INTO bus_events (bus_id, event_type, event_data) VALUES (?, ?, ?)',
    [busId, eventType, JSON.stringify(eventData)]
  );
  return result;
}

async function getBusEvents(busId, limit = 50) {
  const [events] = await pool.query(
    `SELECT * FROM bus_events 
     WHERE bus_id = ? 
     ORDER BY created_at DESC
     LIMIT ?`,
    [busId, limit]
  );
  return events;
}

// ===================================
// ADVANCED QUERIES
// ===================================

async function getBusesByRoute(routeId) {
  const [buses] = await pool.query(
    'SELECT * FROM buses WHERE route_id = ?',
    [routeId]
  );
  return buses;
}

async function getBusesNeedingMaintenance() {
  const [buses] = await pool.query(`
    SELECT * FROM buses 
    WHERE fuel_level < 30 
       OR distance > 150000 
       OR DATEDIFF(CURRENT_DATE, last_maintenance) > 90
    ORDER BY fuel_level ASC, distance DESC
  `);
  return buses;
}

async function getAvailableBuses() {
  const [buses] = await pool.query(
    "SELECT * FROM buses WHERE status IN ('ready', 'waiting') ORDER BY id"
  );
  return buses;
}

module.exports = {
  getAllBuses,
  getBusById,
  getBusStatistics,
  createBus,
  updateBus,
  updateBusStatus,
  deleteBus,
  logBusEvent,
  getBusEvents,
  getBusesByRoute,
  getBusesNeedingMaintenance,
  getAvailableBuses
};