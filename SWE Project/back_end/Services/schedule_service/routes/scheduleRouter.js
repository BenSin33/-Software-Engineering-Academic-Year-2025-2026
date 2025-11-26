const {Router} = require('express');
const scheduleController= require('../controllers/scheduleController.js')
const scheduleRouter = Router();

// Các route khác
scheduleRouter.get('/', scheduleController.getAllSchedules);
scheduleRouter.post('/add', scheduleController.addNewSchedule);
scheduleRouter.put('/edit/:scheduleID',scheduleController.updateSchedule)
scheduleRouter.delete('/delete/:scheduleID',scheduleController.deleteSchedule)
module.exports = scheduleRouter;

