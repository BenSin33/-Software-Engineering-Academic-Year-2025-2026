const { Router } = require('express');
const studentController = require('../controllers/studentController');
const studentRouter = Router();


// Các route khác
studentRouter.get('/', studentController.getAllStudents);
studentRouter.post('/add', studentController.addNewStudent);
studentRouter.post('/edit/:studentID',studentController.updateCurrentStudent)
studentRouter.post('/delete/:studentID',studentController.deleteStudent)
module.exports = studentRouter;

