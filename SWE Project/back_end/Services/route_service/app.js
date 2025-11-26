require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const routeRouter = require('./routes/routeRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mount routes
app.use('/Routes', routeRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'route_service', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`✅ Route Service running on port ${PORT}`));

module.exports = app;