const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const locationRouter = require('./routes/locationRouter'); 
const mapRoutes = require('./routes/mapRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (Giúp debug xem request có đến nơi không)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'location_service' });
});

// ==========================================
// ĐĂNG KÝ ROUTE (Mounting Routes)
// ==========================================

// 1. Nhóm API quản lý Vị trí (Tracking)
app.use('/Location', locationRouter); 

// 2. Nhóm API Bản đồ (Routing, Geocoding)
app.use('/Map', mapRoutes); 

app.get('/', (req, res) => {
    res.send('Location Service is Running...');
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found in Location Service',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Location Service Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5009; 
app.listen(PORT, () => console.log(`📍 Location Service running on port ${PORT}`));