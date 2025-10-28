require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth.controller');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3019;
app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});