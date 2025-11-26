const { Router } = require('express');
const studentController = require('../controllers/studentController');
const studentRouter = Router();

// Các route chính
studentRouter.get('/', studentController.getAllStudents);
studentRouter.get('/route/:id/PickUpPoint', studentController.getPickUpPoint);
studentRouter.post('/add', studentController.addNewStudent);
studentRouter.post('/edit/:studentID', studentController.updateCurrentStudent);
studentRouter.post('/delete/:studentID', studentController.deleteStudent);

// Các route bổ sung
studentRouter.get('/by-parent/:parentID', studentController.getStudentsByParent);
studentRouter.get('/search', studentController.searchStudents);

// Lấy chi tiết một học sinh (nên dùng GET thay vì POST)
studentRouter.get('/:studentID', studentController.getStudent);

studentRouter.patch('/update-parent/:studentID', studentController.updateStudentParent);

module.exports = studentRouter;
