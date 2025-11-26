const service = require('./log.service');
const { v4: uuidv4 } = require('uuid');

function requestLogger(req, res, next) {
  const start = Date.now();
  const traceId = req.headers['x-trace-id'] || uuidv4();
  
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);

  const originalSend = res.send;
  res.send = function(data) {
    res.send = originalSend;
    return originalSend.call(this, data);
  };

  res.on('finish', async () => {
    const duration = Date.now() - start;
    const level = getLogLevel(res.statusCode);
    
    try {
      await service.insertLog({
        ts: new Date(),
        level: level,
        service_name: 'api-gateway',
        message: `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
        trace_id: traceId,
        tags: ['http', req.method.toLowerCase(), `status-${res.statusCode}`],
        request_method: req.method,
        request_url: req.originalUrl,
        response_time: duration,
        user_id: req.user?.id || null,
        ip_address: getClientIp(req)
      });
    } catch (err) {
      console.error('Failed to log request:', err);
    }
  });

  next();
}

function errorLogger(err, req, res, next) {
  const traceId = req.traceId || req.headers['x-trace-id'] || uuidv4();
  
  service.insertLog({
    ts: new Date(),
    level: 'ERROR',
    service_name: 'api-gateway',
    message: `Error: ${err.message}`,
    trace_id: traceId,
    tags: ['error', 'exception'],
    request_method: req.method,
    request_url: req.originalUrl,
    user_id: req.user?.id || null,
    ip_address: getClientIp(req),
    stack_trace: err.stack
  }).catch(logErr => {
    console.error('Failed to log error:', logErr);
  });

  next(err);
}

function dbLogger(operation, tableName) {
  return async function(req, res, next) {
    const start = Date.now();
    
    res.on('finish', async () => {
      const duration = Date.now() - start;
      
      try {
        await service.insertLog({
          ts: new Date(),
          level: 'DEBUG',
          service_name: 'database',
          message: `${operation} on ${tableName} (${duration}ms)`,
          trace_id: req.traceId || req.headers['x-trace-id'],
          tags: ['database', operation.toLowerCase(), tableName],
          response_time: duration,
          user_id: req.user?.id || null
        });
      } catch (err) {
        console.error('Failed to log DB operation:', err);
      }
    });

    next();
  };
}

function authLogger(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    const isSuccess = res.statusCode === 200;
    const level = isSuccess ? 'INFO' : 'WARN';
    
    service.insertLog({
      ts: new Date(),
      level: level,
      service_name: 'auth-service',
      message: `Authentication ${isSuccess ? 'succeeded' : 'failed'} for ${req.body.username || 'unknown'}`,
      trace_id: req.traceId || req.headers['x-trace-id'],
      tags: ['auth', isSuccess ? 'success' : 'failure'],
      ip_address: getClientIp(req),
      user_id: data.userId || null
    }).catch(err => {
      console.error('Failed to log auth attempt:', err);
    });

    return originalJson.call(this, data);
  };

  next();
}

function securityLogger(eventType) {
  return async function(req, res, next) {
    try {
      await service.insertLog({
        ts: new Date(),
        level: 'WARN',
        service_name: 'security',
        message: `Security event: ${eventType}`,
        trace_id: req.traceId || req.headers['x-trace-id'],
        tags: ['security', eventType.toLowerCase()],
        request_method: req.method,
        request_url: req.originalUrl,
        ip_address: getClientIp(req),
        user_id: req.user?.id || null
      });
    } catch (err) {
      console.error('Failed to log security event:', err);
    }
    next();
  };
}

function getLogLevel(statusCode) {
  if (statusCode >= 500) return 'ERROR';
  if (statusCode >= 400) return 'WARN';
  return 'INFO';
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip;
}

module.exports = {
  requestLogger,
  errorLogger,
  dbLogger,
  authLogger,
  securityLogger
};