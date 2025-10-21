const express = require('express');
const studentController = require('../controllers/studentController');

const studentRouter = express.Router();

studentRouter.post('/add', studentController.addNewStudent);

module.exports = studentRouter;

