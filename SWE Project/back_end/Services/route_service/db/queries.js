const pool = require('./pool'); // giả sử pool được config sẵn với mysql2/promise

async function getRoutes() {
  const [rows] = await pool.query('SELECT * FROM routes');
  return rows;
}

async function addRoute(driverID,busID,routeName,startLocation,endLocation) {
  const sql = `
    INSERT INTO routes
      (driverID,busID,routeName,startLocation,endLocation)
    VALUES (?, ?, ?, ?, ?)
  `;

 const [routeID] = await pool.query(sql, [driverID,busID,routeName,startLocation,endLocation]);
 return routeID.insertId;
}

async function updateCurrentRoute(routeID,driverID,busID,routeName,startLocation,endLocation){
  const sql =`
  update routes set driverID=?,busID=?,routeName=?,startLocation=?,endLocation=? where routeID = ?;
  `
  await pool.query(sql,[driverID,busID,routeName,startLocation,endLocation,routeID])
}

async function deleteRoute(routeID){
  const sql=`delete from routes where RouteID= ?`
  await pool.query(sql,[routeID])
}
module.exports = {
  getRoutes,
  addRoute,
  updateCurrentRoute,
  deleteRoute,
};