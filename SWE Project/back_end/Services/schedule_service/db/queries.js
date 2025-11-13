const pool = require('./pool'); // giả sử pool đã được config với mysql2/promise

async function getSchedules() {
  const [rows] = await pool.query('SELECT * FROM schedules');
  return rows;
}

async function getSchedulesByRouteID(routeID) {
  const [rows] = await pool.query('SELECT * FROM schedules WHERE RouteID = ?', [routeID]);
  return rows;
}

async function addSchedule(RouteID, Date, StartTime,EndTime) {
  const sql = `
    INSERT INTO schedules
      (RouteID, Date, TimeStart,TimeEnd)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [RouteID, Date, StartTime,EndTime]);
  return result.insertId;
}

async function updateSchedule(ScheduleID, RouteID, Date, StartTime,EndTime) {
  const sql = `
    UPDATE schedules
    SET RouteID = ?, Date = ?, TimeStart = ?, TimeEnd = ?
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
  deleteSchedule
};
