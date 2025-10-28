require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const locationRouter = require('./routes/locationRouter');
const mapRouter = require('./routes/mapRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mount routers
app.use('/locations', locationRouter);
app.use('/maps', mapRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'Location Service',
    timestamp: new Date().toISOString(),
    mapApis: {
      openrouteservice: !!process.env.ORS_API_KEY,
      maptiler: !!process.env.MAPTILER_API_KEY
    }
  });
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Location Service running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - GET  /locations/bus-locations`);
  console.log(`  - GET  /locations/routes`);
  console.log(`  - GET  /locations/pickup-dropoff-points`);
  console.log(`  - GET  /locations/geofences`);
  console.log(`  - GET  /locations/alerts`);
  console.log(`  - GET  /maps/config`);
  console.log(`  - POST /maps/route`);
  console.log(`  - POST /maps/route/optimize`);
  console.log(`  - GET  /maps/geocode`);
});