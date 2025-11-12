const {Router} = require('express');
const studentController= require('../controllers/studentController')
const studentRouter = Router();

// Các route khác
studentRouter.get('/', studentController.getAllStudents);
studentRouter.get('/route/:id/PickUpPoint',studentController.getPickUpPoint)
studentRouter.post('/add', studentController.addNewStudent);
studentRouter.post('/edit/:studentID',studentController.updateCurrentStudent)
studentRouter.post('/delete/:studentID',studentController.deleteStudent)
studentRouter.get('/by-parent/:parentID', studentController.getStudentsByParent);
module.exports = studentRouter;

