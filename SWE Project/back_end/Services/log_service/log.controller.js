const service = require('./log.service');

async function createBatch(req, res) {
  try {
    const logs = req.body.logs;
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'logs_must_be_array' });
    }
    const result = await service.insertLogs(logs);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed_to_insert_logs' });
  }
}

async function create(req, res) {
  try {
    const log = req.body;
    const result = await service.insertLog(log);
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed_to_insert_log' });
  }
}

async function find(req, res) {
  const filters = {
    level: req.query.level,
    service: req.query.service,
    q: req.query.q,
    from: req.query.from,
    to: req.query.to,
    trace_id: req.query.trace_id,
    tags: req.query.tags ? req.query.tags.split(',').map(s => s.trim()) : [],
    sort: req.query.sort,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    page: req.query.page ? Number(req.query.page) : undefined
  };

  try {
    const result = await service.searchLogs(filters);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed_to_search_logs' });
  }
}

// API chuyên biệt
async function logLogin(req, res) {
  try {
    const { userId } = req.body;
    const result = await service.insertLog({
      ts: new Date(),
      level: 'INFO',
      service_name: 'auth-service',
      message: `User ${userId} logged in`,
      trace_id: req.headers['x-trace-id'] || null,
      tags: ['auth', 'login']
    });
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed_to_log_login' });
  }
}

async function logLogout(req, res) {
  try {
    const { userId } = req.body;
    const result = await service.insertLog({
      ts: new Date(),
      level: 'INFO',
      service_name: 'auth-service',
      message: `User ${userId} logged out`,
      trace_id: req.headers['x-trace-id'] || null,
      tags: ['auth', 'logout']
    });
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed_to_log_logout' });
  }
}

async function logUserUpdate(req, res) {
  try {
    const { userId, fields } = req.body;
    const result = await service.insertLog({
      ts: new Date(),
      level: 'INFO',
      service_name: 'user-service',
      message: `User ${userId} updated fields: ${fields.join(', ')}`,
      trace_id: req.headers['x-trace-id'] || null,
      tags: ['user', 'update']
    });
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed_to_log_user_update' });
  }
}

module.exports = {
  create,
  createBatch,
  find,
  logLogin,
  logLogout,
  logUserUpdate
};
