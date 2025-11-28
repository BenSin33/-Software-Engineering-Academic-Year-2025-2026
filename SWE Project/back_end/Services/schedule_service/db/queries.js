const pool = require('./pool'); // giả sử pool đã được config với mysql2/promise

async function getSchedules() {
  const [rows] = await pool.query('SELECT * FROM schedules');
  return rows;
}

async function getSchedulesByRouteID(routeID) {
  const [rows] = await pool.query('SELECT * FROM schedules WHERE RouteID = ?', [routeID]);
  return rows;
}

async function addSchedule(RouteID, DriverID, Date, StartTime,EndTime) {
  const sql = `
    INSERT INTO schedules
      (RouteID, DriverID, Date, TimeStart, TimeEnd, status)
    VALUES (?, ?, ?, ?, ?, 'NOT_STARTED')
  `;
  const [result] = await pool.query(sql, [RouteID, DriverID, Date, StartTime,EndTime]);
  return result.insertId;
}

async function getSchedulesByDriverID(driverID) {
  const sql = `
    SELECT 
      ScheduleID as id,
      RouteID, 
      Date as date,
      TimeStart as startTime,
      TimeEnd as endTime,
      status
    FROM schedules
    WHERE DriverID = ?
    ORDER BY Date DESC, TimeStart ASC
  `;
  const [rows] = await pool.query(sql, [driverID]);
  return rows;
}

async function updateSchedule(ScheduleID, RouteID, Date, StartTime,EndTime) {
  const sql = `
    UPDATE schedules
    SET RouteID = ?, \`Date\` = ?, TimeStart = ?, TimeEnd = ?
    WHERE ScheduleID = ?
  `;
  await pool.query(sql, [RouteID, Date, StartTime,EndTime, ScheduleID]);
}

async function deleteSchedule(ScheduleID) {
  const sql = `DELETE FROM schedules WHERE ScheduleID = ?`;
  await pool.query(sql, [ScheduleID]);
}

module.exports = {
  getSchedules,
  getSchedulesByRouteID,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByDriverID
};
