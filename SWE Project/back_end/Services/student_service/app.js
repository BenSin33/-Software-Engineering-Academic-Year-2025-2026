require('dotenv').config();
const cors=require('cors')
const express=require('express');
const app=express();
const studentRouter=require('./routes/studentRouter')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/students',studentRouter);
app.listen(5001, () => console.log('Server running on port 5001'));