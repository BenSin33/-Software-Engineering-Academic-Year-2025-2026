const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes

const authRoutes = require('./routes/authRoutes');
//const studentRoutes = require('./routes/studentRoutes');
const studentroutes = require('./routes/studentRoutes.js');
const routeRoutes = require('./routes/routeRoutes');
const locationRoutes = require('./routes/locationRoutes.js');
const scheduleRoutes = require('./routes/scheduleRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js');
const driverRoutes = require('../Services/user_service/routes/driverRoutes');
const parentRoutes = require('../Services/user_service/routes/parentRoutes');
const userRoutes = require('../Services/user_service/routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes.js')
const ORS = require('./routes/ORSdrivingCar.js')

const busRoutes = require('../Services/bus_service/routes/busRoutes');
const bus_driverRoutes = require('../Services/bus_service/routes/driverRoutes');

// Use routes

app.use("/accounts",accountRoutes)
app.use("/api/auth", authRoutes);
//app.use("/Students", studentRoutes);
app.use('/api/students', studentroutes);
app.use('/routes', routeRoutes)
app.use('/location', locationRoutes)
app.use('/Schedules', scheduleRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/drivers', driverRoutes);
app.use('/api/parents', parentRoutes);//
app.use('/api/users', userRoutes);

app.use('/ORS', ORS)

app.use('/api/buses', busRoutes);
app.use('/api/bus-drivers', bus_driverRoutes);


const PORT = 5000;
app.listen(PORT, () => {
    console.log('API Gateway running on port', PORT);
});