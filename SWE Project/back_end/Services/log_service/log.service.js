const pool = require('./db');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

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
    log.tags ? JSON.stringify(log.tags) : null,
    log.user_id || null,
    log.ip_address || null,
    log.request_method || null,
    log.request_url || null,
    log.response_time || null,
    log.stack_trace || null
  ]);

  const sql = `
    INSERT INTO logs (
      ts, level, service_name, message, trace_id, tags,
      user_id, ip_address, request_method, request_url, 
      response_time, stack_trace
    ) VALUES ?
  `;

  try {
    const [result] = await pool.query(sql, [values]);
    return { 
      accepted: result.affectedRows, 
      failed: logs.length - result.affectedRows 
    };
  } catch (err) {
    console.error('Error inserting logs:', err);
    return { accepted: 0, failed: logs.length };
  }
}

async function insertLog(log) {
  const result = await insertLogs([log]);
  return result;
}

function buildWhereClause(filters) {
  const where = [];
  const params = [];

  if (filters.level) {
    where.push(`level = ?`);
    params.push(filters.level);
  }

  if (filters.service) {
    where.push(`service_name = ?`);
    params.push(filters.service);
  }

  if (filters.trace_id) {
    where.push(`trace_id = ?`);
    params.push(filters.trace_id);
  }

  if (filters.user_id) {
    where.push(`user_id = ?`);
    params.push(filters.user_id);
  }

  if (filters.q) {
    where.push(`MATCH(message) AGAINST(? IN NATURAL LANGUAGE MODE)`);
    params.push(filters.q);
  }

  if (filters.from) {
    where.push(`ts >= ?`);
    params.push(new Date(filters.from));
  }

  if (filters.to) {
    where.push(`ts <= ?`);
    params.push(new Date(filters.to));
  }

  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map(tag => {
      params.push(tag);
      return `JSON_CONTAINS(tags, JSON_QUOTE(?))`;
    });
    where.push(`(${tagConditions.join(' AND ')})`);
  }

  return {
    clause: where.length ? 'WHERE ' + where.join(' AND ') : '',
    params
  };
}

async function searchLogs(filters) {
  const cacheKey = `search:${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const whereClause = buildWhereClause(filters);
  const order = filters.sort === 'timestamp.asc' ? 'ts ASC' : 'ts DESC';
  const limit = Math.min(filters.limit ?? 50, 500);
  const offset = ((filters.page ?? 1) - 1) * limit;

  const dataSql = `
    SELECT * FROM logs 
    ${whereClause.clause}
    ORDER BY ${order} 
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total FROM logs 
    ${whereClause.clause}
  `;

  try {
    const [items] = await pool.query(dataSql, [...whereClause.params, limit, offset]);
    const [countRows] = await pool.query(countSql, whereClause.params);

    const result = {
      items,
      page: filters.page ?? 1,
      limit,
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / limit)
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Error searching logs:', err);
    throw err;
  }
}

async function getLogStats(filters) {
  const whereClause = buildWhereClause(filters);
  
  const sql = `
    SELECT 
      level,
      service_name,
      DATE(ts) as date,
      COUNT(*) as count,
      AVG(response_time) as avg_response_time
    FROM logs
    ${whereClause.clause}
    GROUP BY level, service_name, DATE(ts)
    ORDER BY date DESC, count DESC
    LIMIT 100
  `;

  try {
    const [stats] = await pool.query(sql, whereClause.params);
    return stats;
  } catch (err) {
    console.error('Error getting log stats:', err);
    throw err;
  }
}

async function getErrorRate(serviceName, timeRange = '1h') {
  const timeMap = {
    '1h': 1,
    '6h': 6,
    '24h': 24,
    '7d': 168
  };

  const hours = timeMap[timeRange] || 1;

  const sql = `
    SELECT 
      COUNT(CASE WHEN level = 'ERROR' THEN 1 END) as error_count,
      COUNT(*) as total_count,
      ROUND(COUNT(CASE WHEN level = 'ERROR' THEN 1 END) * 100.0 / COUNT(*), 2) as error_rate
    FROM logs
    WHERE service_name = ?
      AND ts >= DATE_SUB(NOW(), INTERVAL ? HOUR)
  `;

  try {
    const [result] = await pool.query(sql, [serviceName, hours]);
    return result[0];
  } catch (err) {
    console.error('Error getting error rate:', err);
    throw err;
  }
}

async function getServiceList() {
  const cacheKey = 'services:list';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const sql = `
    SELECT DISTINCT 
      service_name,
      COUNT(*) as log_count,
      MAX(ts) as last_log
    FROM logs
    WHERE ts >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY service_name
    ORDER BY log_count DESC
  `;

  try {
    const [services] = await pool.query(sql);
    cache.set(cacheKey, services, 300);
    return services;
  } catch (err) {
    console.error('Error getting service list:', err);
    throw err;
  }
}

async function cleanupOldLogs(days = 30) {
  const sql = `
    DELETE FROM logs
    WHERE ts < DATE_SUB(NOW(), INTERVAL ? DAY)
  `;

  try {
    const [result] = await pool.query(sql, [days]);
    cache.flushAll();
    return result;
  } catch (err) {
    console.error('Error cleaning up logs:', err);
    throw err;
  }
}

function convertToCSV(logs) {
  if (!logs || logs.length === 0) {
    return '';
  }

  const headers = [
    'id', 'timestamp', 'level', 'service_name', 'message', 
    'trace_id', 'tags', 'user_id', 'ip_address', 
    'request_method', 'request_url', 'response_time'
  ];

  const rows = logs.map(log => [
    log.id,
    log.ts,
    log.level,
    log.service_name,
    `"${(log.message || '').replace(/"/g, '""')}"`,
    log.trace_id || '',
    log.tags || '',
    log.user_id || '',
    log.ip_address || '',
    log.request_method || '',
    log.request_url || '',
    log.response_time || ''
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}

async function logError(error, context = {}) {
  try {
    return await insertLog({
      ts: new Date(),
      level: 'ERROR',
      service_name: context.service || 'system',
      message: error.message || 'Unknown error',
      trace_id: context.trace_id || null,
      tags: ['error', 'system', ...(context.tags || [])],
      stack_trace: error.stack || null,
      user_id: context.user_id || null
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}

async function getHourlyDistribution(serviceName, hours = 24) {
  const sql = `
    SELECT 
      DATE_FORMAT(ts, '%Y-%m-%d %H:00:00') as hour,
      level,
      COUNT(*) as count
    FROM logs
    WHERE service_name = ?
      AND ts >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    GROUP BY hour, level
    ORDER BY hour DESC
  `;

  try {
    const [distribution] = await pool.query(sql, [serviceName, hours]);
    return distribution;
  } catch (err) {
    console.error('Error getting hourly distribution:', err);
    throw err;
  }
}

async function getTopErrors(limit = 10, hours = 24) {
  const sql = `
    SELECT 
      message,
      service_name,
      COUNT(*) as count,
      MAX(ts) as last_occurrence
    FROM logs
    WHERE level = 'ERROR'
      AND ts >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    GROUP BY message, service_name
    ORDER BY count DESC
    LIMIT ?
  `;

  try {
    const [errors] = await pool.query(sql, [hours, limit]);
    return errors;
  } catch (err) {
    console.error('Error getting top errors:', err);
    throw err;
  }
}

module.exports = {
  insertLog,
  insertLogs,
  searchLogs,
  getLogStats,
  getErrorRate,
  getServiceList,
  cleanupOldLogs,
  convertToCSV,
  logError,
  getHourlyDistribution,
  getTopErrors
};