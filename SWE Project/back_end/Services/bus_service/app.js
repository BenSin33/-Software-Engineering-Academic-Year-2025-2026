const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const busRoutes = require('./routes/busRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Import event publisher
const eventPublisher = require('./events/eventPublisher');

const app = express();

// ===================================
// MIDDLEWARE
// ===================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ===================================
// HEALTH CHECK
// ===================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'bus_service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'bus_service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ===================================
// ROUTES
// ===================================
app.use('/api/buses', busRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/locations', locationRoutes);

// ===================================
// ERROR HANDLING
// ===================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===================================
// INITIALIZE EVENT PUBLISHER
// ===================================
// eventPublisher.connect().catch(err => {
//   console.error('Failed to connect to RabbitMQ:', err);
// });

// ===================================
// EXPORT APP - QUAN TRỌNG!
// ===================================
module.exports = app;