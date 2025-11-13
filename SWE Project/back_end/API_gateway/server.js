const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes

const authRoutes = require('./routes/authRoutes');
//const studentRoutes = require('./routes/studentRoutes');
const studentroutes = require('../Services/student_service/routes/studentRouter');
const routeRoutes = require('./routes/routeRoutes');
const locationRoutes=require('./routes/locationRoutes.js');
const scheduleRoutes = require('./routes/scheduleRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js');
const driverRoutes = require('../Services/user_service/routes/driverRoutes');
const parentRoutes = require('../Services/user_service/routes/parentRoutes');
const userRoutes = require('../Services/user_service/routes/userRoutes');

app.use("/api/auth", authRoutes);
//app.use("/Students", studentRoutes);
app.use('/students',studentroutes);
app.use('/routes',routeRoutes)
app.use('/location',locationRoutes)
app.use('/Schedules',scheduleRoutes)
app.use('/api/messges', messageRoutes)
app.use('/api/drivers', driverRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/users', userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log('API Gateway running on port', PORT);
});