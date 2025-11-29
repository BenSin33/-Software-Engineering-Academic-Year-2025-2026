const pool = require('./pool'); // giả sử pool đã được config với mysql2/promise

async function getSchedules() {
  const [rows] = await pool.query('SELECT * FROM schedules');
  return rows;
}

async function getSchedulesByRouteID(routeID) {
  const [rows] = await pool.query('SELECT * FROM schedules WHERE RouteID = ?', [routeID]);
  return rows;
}

async function addSchedule(RouteID, DriverID, Date, StartTime, EndTime) {
  const sql = `
    INSERT INTO schedules
      (RouteID, DriverID, Date, TimeStart, TimeEnd)
    VALUES (?, ?, ?, ?, ?)
  `;
  // Lưu ý: Thứ tự biến phải khớp với dấu ?
  const [result] = await pool.query(sql, [RouteID, DriverID, Date, StartTime, EndTime]);
  return result.insertId;
}

async function updateSchedule(ScheduleID, RouteID, DriverID, Date, StartTime, EndTime) {
  const sql = `
    UPDATE schedules
    SET RouteID = ?, DriverID = ?, \`Date\` = ?, TimeStart = ?, TimeEnd = ?
    WHERE ScheduleID = ?
  `;
  await pool.query(sql, [RouteID, DriverID, Date, StartTime, EndTime, ScheduleID]);
}

async function deleteSchedule(ScheduleID) {
  const sql = `DELETE FROM schedules WHERE ScheduleID = ?`;
  await pool.query(sql, [ScheduleID]);
}

async function getSchedulesByDriverID(driverID) {
  // Lấy lịch của tài xế đó, ưu tiên lịch chưa chạy hoặc đang chạy (Date >= hôm nay)
  const sql = `
    SELECT * FROM schedules 
    WHERE DriverID = ? 
    ORDER BY Date ASC, TimeStart ASC
  `;
  const [rows] = await pool.query(sql, [driverID]);
  return rows;
}

module.exports = {
  getSchedules,
  getSchedulesByRouteID,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByDriverID
};
