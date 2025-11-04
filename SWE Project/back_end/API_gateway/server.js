const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const routeRoutes = require('./routes/routeRoutes');
const locationRoutes=require('./routes/locationRoutes.js');
const scheduleRoutes = require('./routes/scheduleRoutes.js')

app.use("/api/auth", authRoutes);
app.use("/Students", studentRoutes);
app.use('/routes',routeRoutes)
app.use('/location',locationRoutes)
app.use('/Schedules',scheduleRoutes)
const PORT = 5000;
app.listen(PORT, () => {
    console.log('API Gateway running on port', PORT);
});