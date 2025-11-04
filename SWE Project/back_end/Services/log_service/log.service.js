const pool = require('./db');

async function insertLogs(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return { accepted: 0, failed: 0 };
  }

  const values = logs.map(log => [
    log.ts ? new Date(log.ts) : new Date(),
    (log.level || 'INFO').toUpperCase(),
    log.service_name || 'unknown',
    log.message || '',
    log.trace_id || null,
    log.tags ? JSON.stringify(log.tags) : null
  ]);

  const sql = `
    INSERT INTO logs (ts, level, service_name, message, trace_id, tags)
    VALUES ?
  `;

  const [result] = await pool.query(sql, [values]);
  return { accepted: result.affectedRows, failed: logs.length - result.affectedRows };
}

async function insertLog(log) {
  return insertLogs([log]);
}

async function searchLogs(filters) {
  const where = [];
  const params = [];

  if (filters.level) { where.push(`level = ?`); params.push(filters.level); }
  if (filters.service) { where.push(`service_name = ?`); params.push(filters.service); }
  if (filters.trace_id) { where.push(`trace_id = ?`); params.push(filters.trace_id); }
  if (filters.q) { where.push(`MATCH(message) AGAINST(? IN NATURAL LANGUAGE MODE)`); params.push(filters.q); }
  if (filters.from) { where.push(`ts >= ?`); params.push(new Date(filters.from)); }
  if (filters.to) { where.push(`ts <= ?`); params.push(new Date(filters.to)); }
  if (filters.tags?.length) {
    const tagClauses = filters.tags.map(() => `JSON_CONTAINS(tags, JSON_ARRAY(?))`);
    where.push(tagClauses.join(' AND '));
    params.push(...filters.tags);
  }

  const order = filters.sort === 'timestamp.asc' ? 'ts ASC' : 'ts DESC';
  const limit = Math.min(filters.limit ?? 50, 500);
  const offset = ((filters.page ?? 1) - 1) * limit;

  const base = `FROM logs ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
  const dataSql = `SELECT * ${base} ORDER BY ${order} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) AS total ${base}`;

  const [items] = await pool.query(dataSql, params.concat([limit, offset]));
  const [countRows] = await pool.query(countSql, params);

  return {
    items,
    page: filters.page ?? 1,
    limit,
    total: countRows[0].total
  };
}

module.exports = { insertLog, insertLogs, searchLogs };
