const app = require('./app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log(`🚌 Bus Service`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════');
  console.log('Available endpoints:');
  console.log('  - GET    /api/buses');
  console.log('  - POST   /api/buses');
  console.log('  - GET    /api/buses/:id');
  console.log('  - PUT    /api/buses/:id');
  console.log('  - DELETE /api/buses/:id');
  console.log('  - PATCH  /api/buses/:id/status');
  console.log('  - GET    /api/buses/stats/summary');
  console.log('  - GET    /api/maintenance');
  console.log('  - POST   /api/maintenance/bus/:id');
  console.log('  - GET    /api/locations/current');
  console.log('  - POST   /api/locations/bus/:id');
  console.log('═══════════════════════════════════════════');
});