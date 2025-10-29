const cors=require('cors')
const express=require('express');
const app=express();
const locationRoutes=require('./routes/locationRoutes.js')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/location',locationRoutes);
app.listen(5010, () => console.log('Server running on port 5010'));