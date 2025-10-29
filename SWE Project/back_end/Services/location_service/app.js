
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const locationRoutes = require('./routes/locationRouter');
const mapRoutes = require('./routes/mapRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'location_service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apis: {
      openRouteService: !!process.env.ORS_API_KEY,
      mapTiler: !!process.env.MAPTILER_API_KEY
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'location_service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apis: {
      openRouteService: !!process.env.ORS_API_KEY,
      mapTiler: !!process.env.MAPTILER_API_KEY
    }
  });
});

app.use('/api/locations', locationRoutes);
app.use('/api/map', mapRoutes);


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

module.exports = app;