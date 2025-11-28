const service = require('./log.service');
const Joi = require('joi');

const logSchema = Joi.object({
  ts: Joi.date().optional(),
  level: Joi.string().valid('ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE').default('INFO'),
  service_name: Joi.string().max(100).required(),
  message: Joi.string().max(2000).required(),
  trace_id: Joi.string().uuid().optional().allow(null),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  user_id: Joi.number().integer().optional().allow(null),
  ip_address: Joi.string().ip().optional().allow(null),
  request_method: Joi.string().max(10).optional().allow(null),
  request_url: Joi.string().max(500).optional().allow(null),
  response_time: Joi.number().integer().min(0).optional().allow(null),
  stack_trace: Joi.string().max(5000).optional().allow(null)
});

const batchLogSchema = Joi.object({
  logs: Joi.array().items(logSchema).min(1).max(1000).required()
});

const searchSchema = Joi.object({
  level: Joi.string().valid('ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE').optional(),
  service: Joi.string().max(100).optional(),
  q: Joi.string().max(200).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  trace_id: Joi.string().uuid().optional(),
  tags: Joi.string().optional(),
  sort: Joi.string().valid('timestamp.asc', 'timestamp.desc').default('timestamp.desc'),
  limit: Joi.number().integer().min(1).max(500).default(50),
  page: Joi.number().integer().min(1).default(1),
  user_id: Joi.number().integer().optional()
});

function extractUserContext(req) {
  return {
    user_id: req.user?.id || null,
    ip_address: req.ip || req.connection.remoteAddress || null
  };
}

async function createBatch(req, res) {
  try {
    const { error, value } = batchLogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'validation_error', 
        details: error.details[0].message 
      });
    }

    const result = await service.insertLogs(value.logs);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error in createBatch:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'createBatch',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_insert_logs' });
  }
}

async function create(req, res) {
  try {
    const { error, value } = logSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'validation_error', 
        details: error.details[0].message 
      });
    }

    const result = await service.insertLog(value);
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error('Error in create:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'create',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_insert_log' });
  }
}

async function find(req, res) {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ 
        error: 'validation_error', 
        details: error.details[0].message 
      });
    }

    const filters = {
      ...value,
      tags: value.tags ? value.tags.split(',').map(s => s.trim()) : []
    };

    const result = await service.searchLogs(filters);
    res.json(result);
  } catch (err) {
    console.error('Error in find:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'find',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_search_logs' });
  }
}

async function getStats(req, res) {
  try {
    const filters = {
      service: req.query.service,
      from: req.query.from,
      to: req.query.to
    };

    const stats = await service.getLogStats(filters);
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error in getStats:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'getStats',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_get_stats' });
  }
}

async function getErrorRate(req, res) {
  try {
    const service_name = req.query.service;
    const timeRange = req.query.range || '1h';

    if (!service_name) {
      return res.status(400).json({ error: 'service_name_required' });
    }

    const errorRate = await service.getErrorRate(service_name, timeRange);
    res.json({ success: true, errorRate });
  } catch (err) {
    console.error('Error in getErrorRate:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'getErrorRate',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_get_error_rate' });
  }
}

async function getServices(req, res) {
  try {
    const services = await service.getServiceList();
    res.json({ success: true, services });
  } catch (err) {
    console.error('Error in getServices:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'getServices',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_get_services' });
  }
}

async function cleanup(req, res) {
  try {
    const days = parseInt(req.query.days) || 30;
    
    if (days < 7) {
      return res.status(400).json({ error: 'minimum_7_days' });
    }

    const result = await service.cleanupOldLogs(days);
    res.json({ success: true, deleted: result.affectedRows });
  } catch (err) {
    console.error('Error in cleanup:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'cleanup',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_cleanup_logs' });
  }
}

async function exportLogs(req, res) {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ 
        error: 'validation_error', 
        details: error.details[0].message 
      });
    }

    const filters = {
      ...value,
      tags: value.tags ? value.tags.split(',').map(s => s.trim()) : [],
      limit: 10000
    };

    const logs = await service.searchLogs(filters);
    const csv = service.convertToCSV(logs.items);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="logs-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Error in exportLogs:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'exportLogs',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_export_logs' });
  }
}

async function logLogin(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId_required' });
    }

    const context = extractUserContext(req);
    const result = await service.insertLog({
      ts: new Date(),
      level: 'INFO',
      service_name: 'auth-service',
      message: `User ${userId} logged in`,
      trace_id: req.headers['x-trace-id'] || null,
      tags: ['auth', 'login'],
      user_id: userId,
      ip_address: context.ip_address
    });
    
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error('Error in logLogin:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'logLogin',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_log_login' });
  }
}

async function logLogout(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId_required' });
    }

    const context = extractUserContext(req);
    const result = await service.insertLog({
      ts: new Date(),
      level: 'INFO',
      service_name: 'auth-service',
      message: `User ${userId} logged out`,
      trace_id: req.headers['x-trace-id'] || null,
      tags: ['auth', 'logout'],
      user_id: userId,
      ip_address: context.ip_address
    });
    
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error('Error in logLogout:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'logLogout',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_log_logout' });
  }
}

async function logUserUpdate(req, res) {
  try {
    const { userId, fields } = req.body;
    if (!userId || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'userId_and_fields_required' });
    }

    const context = extractUserContext(req);
    const result = await service.insertLog({
      ts: new Date(),
      level: 'INFO',
      service_name: 'user-service',
      message: `User ${userId} updated fields: ${fields.join(', ')}`,
      trace_id: req.headers['x-trace-id'] || null,
      tags: ['user', 'update'],
      user_id: userId,
      ip_address: context.ip_address
    });
    
    res.status(201).json({ success: true, result });
  } catch (err) {
    console.error('Error in logUserUpdate:', err);
    await service.logError(err, {
      service: 'log-service',
      action: 'logUserUpdate',
      trace_id: req.headers['x-trace-id']
    });
    res.status(500).json({ error: 'failed_to_log_user_update' });
  }
}

module.exports = {
  create,
  createBatch,
  find,
  getStats,
  getErrorRate,
  getServices,
  cleanup,
  exportLogs,
  logLogin,
  logLogout,
  logUserUpdate
}