require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const studentRouter = require('./routes/studentRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/students', studentRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Student Service running on port ${PORT}`));