const pool = require('./pool');

// ===================================
// MAINTENANCE OPERATIONS
// ===================================

async function getMaintenanceHistory(busId, limit = 50) {
  const [history] = await pool.query(
    `SELECT * FROM bus_maintenance_history 
     WHERE bus_id = ? 
     ORDER BY maintenance_date DESC
     LIMIT ?`,
    [busId, limit]
  );
  return history;
}

async function getAllMaintenanceRecords(filters = {}) {
  const {
    busId,
    maintenanceType,
    startDate,
    endDate,
    mechanicName,
    minCost,
    maxCost
  } = filters;

  let query = 'SELECT * FROM bus_maintenance_history WHERE 1=1';
  const params = [];

  if (busId) {
    query += ' AND bus_id = ?';
    params.push(busId);
  }

  if (maintenanceType) {
    query += ' AND maintenance_type = ?';
    params.push(maintenanceType);
  }

  if (startDate) {
    query += ' AND maintenance_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND maintenance_date <= ?';
    params.push(endDate);
  }

  if (mechanicName) {
    query += ' AND mechanic_name LIKE ?';
    params.push(`%${mechanicName}%`);
  }

  if (minCost) {
    query += ' AND cost >= ?';
    params.push(parseFloat(minCost));
  }

  if (maxCost) {
    query += ' AND cost <= ?';
    params.push(parseFloat(maxCost));
  }

  query += ' ORDER BY maintenance_date DESC';

  const [records] = await pool.query(query, params);
  return records;
}

async function addMaintenanceRecord(maintenanceData) {
  const {
    bus_id,
    maintenance_type,
    description,
    cost,
    maintenance_date,
    mechanic_name,
    next_maintenance_date
  } = maintenanceData;

  const [result] = await pool.query(
    `INSERT INTO bus_maintenance_history 
     (bus_id, maintenance_type, description, cost, maintenance_date, mechanic_name, next_maintenance_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [bus_id, maintenance_type, description, cost, maintenance_date, mechanic_name, next_maintenance_date]
  );

  // Update last_maintenance in buses table
  await pool.query(
    'UPDATE buses SET last_maintenance = ? WHERE id = ?',
    [maintenance_date, bus_id]
  );

  return result;
}

async function updateMaintenanceRecord(recordId, updateData) {
  const fields = Object.keys(updateData);
  const values = fields.map(key => updateData[key]);
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  values.push(recordId);

  const [result] = await pool.query(
    `UPDATE bus_maintenance_history SET ${setClause} WHERE id = ?`,
    values
  );

  return result;
}

async function deleteMaintenanceRecord(recordId) {
  const [result] = await pool.query(
    'DELETE FROM bus_maintenance_history WHERE id = ?',
    [recordId]
  );
  return result;
}

async function getMaintenanceStatistics() {
  const [stats] = await pool.query(`
    SELECT 
      COUNT(*) as totalRecords,
      SUM(cost) as totalCost,
      AVG(cost) as avgCost,
      COUNT(DISTINCT bus_id) as busesServiced,
      SUM(CASE WHEN maintenance_type = 'routine' THEN 1 ELSE 0 END) as routineCount,
      SUM(CASE WHEN maintenance_type = 'repair' THEN 1 ELSE 0 END) as repairCount,
      SUM(CASE WHEN maintenance_type = 'inspection' THEN 1 ELSE 0 END) as inspectionCount,
      SUM(CASE WHEN maintenance_type = 'emergency' THEN 1 ELSE 0 END) as emergencyCount
    FROM bus_maintenance_history
  `);
  return stats[0];
}

async function getUpcomingMaintenance() {
  const [upcoming] = await pool.query(`
    SELECT 
      bmh.bus_id,
      bmh.next_maintenance_date,
      b.license_plate,
      b.model,
      b.status,
      DATEDIFF(bmh.next_maintenance_date, CURRENT_DATE) as days_until
    FROM bus_maintenance_history bmh
    INNER JOIN buses b ON bmh.bus_id = b.id
    WHERE bmh.next_maintenance_date IS NOT NULL
      AND bmh.next_maintenance_date >= CURRENT_DATE
      AND bmh.id IN (
        SELECT MAX(id) 
        FROM bus_maintenance_history 
        WHERE next_maintenance_date IS NOT NULL
        GROUP BY bus_id
      )
    ORDER BY bmh.next_maintenance_date ASC
  `);
  return upcoming;
}

async function getOverdueMaintenance() {
  const [overdue] = await pool.query(`
    SELECT 
      bmh.bus_id,
      bmh.next_maintenance_date,
      b.license_plate,
      b.model,
      b.status,
      DATEDIFF(CURRENT_DATE, bmh.next_maintenance_date) as days_overdue
    FROM bus_maintenance_history bmh
    INNER JOIN buses b ON bmh.bus_id = b.id
    WHERE bmh.next_maintenance_date < CURRENT_DATE
      AND bmh.id IN (
        SELECT MAX(id) 
        FROM bus_maintenance_history 
        WHERE next_maintenance_date IS NOT NULL
        GROUP BY bus_id
      )
    ORDER BY days_overdue DESC
  `);
  return overdue;
}

module.exports = {
  getMaintenanceHistory,
  getAllMaintenanceRecords,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceStatistics,
  getUpcomingMaintenance,
  getOverdueMaintenance
};