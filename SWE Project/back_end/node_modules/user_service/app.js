require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const parentRoutes = require('./routes/parentRoutes');
const driverRoutes = require('./routes/driverRoutes');


const app = express();
const PORT = process.env.PORT || 3019;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/drivers', driverRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Lỗi server' });
});

app.listen(PORT, () => {
  console.log(`User Service (auth_db) running on http://localhost:${PORT}`);
});