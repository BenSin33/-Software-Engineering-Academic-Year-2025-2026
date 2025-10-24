require('dotenv').config();
const cors=require('cors')
const express=require('express');
const app=express();
const routeRouter=require('./routes/routeRouter')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/Routes',routeRouter);
app.listen(3005, () => console.log('Server running on port 3005'));