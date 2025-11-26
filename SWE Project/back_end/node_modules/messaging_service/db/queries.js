const pool = require('./pool');

module.exports = {
  query: async (sql, params) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return [rows];
    } catch (error) {
      // Log chi tiết lỗi để debug
      console.error('Database query error:', {
        sql: sql.substring(0, 100),
        params,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      });
      throw error;
    } finally {
      connection.release();
    }
  }
};