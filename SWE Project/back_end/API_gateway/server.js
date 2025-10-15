const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Import routes

const authRoutes = require('../Services/auth_service/auth.controller');

app.use("/api/auth",authRoutes);

const PORT = 5000;
app.listen(PORT, ()=>{
    console.log('API Gateway running on port', PORT);
});