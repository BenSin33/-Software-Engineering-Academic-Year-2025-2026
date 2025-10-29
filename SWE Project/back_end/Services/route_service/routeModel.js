import pool from "./dbRoute.js";

export async function getAllRoutes() {
  const [rows] = await pool.query("SELECT * FROM routes");
  return rows;
}
