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
const messageRoutes = require('./routes/messageRoutes.js');
const ORS = require('./routes/ORSdrivingCar.js')

app.use("/api/auth", authRoutes);
app.use("/Students", studentRoutes);
app.use('/routes',routeRoutes)
app.use('/location',locationRoutes)
app.use('/Schedules',scheduleRoutes)
app.use('/api/messges', messageRoutes)
app.use('/ORS',ORS)
const PORT = 5000;
app.listen(PORT, () => {
    console.log('API Gateway running on port', PORT);
});