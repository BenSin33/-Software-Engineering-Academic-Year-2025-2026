
const app = require('./app');
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`📍 Location Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/locations`);
});