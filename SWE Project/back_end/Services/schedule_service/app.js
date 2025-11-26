require('dotenv').config();
const cors=require('cors')
const express=require('express');
const app=express();
const scheduleRouter=require('./routes/scheduleRouter.js')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/Schedules',scheduleRouter);
app.listen(5005, () => console.log('Server running on port 5005'));