require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3019;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Lỗi server' });
});

app.listen(PORT, () => {
  console.log(`User Service (auth_db) running on http://localhost:${PORT}`);
});