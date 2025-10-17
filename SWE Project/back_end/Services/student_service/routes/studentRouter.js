const {Router} = require('express');
const studentController= require('../controllers/studentController')
const studentRouter = Router();
studentRouter.post('/add',studentController.addNewStudent)