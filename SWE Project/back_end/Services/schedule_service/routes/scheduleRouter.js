const {Router} = require('express');
const scheduleController= require('../controllers/scheduleController.js')
const authMiddleware = require('../middleware/auth.middleware');
const scheduleRouter = Router();

// Các route khác
scheduleRouter.get('/driver/my-schedules', authMiddleware.verifyToken, scheduleController.getMySchedules);
scheduleRouter.get('/driver/:driverID', scheduleController.getSchedulesByDriverID); 
scheduleRouter.get('/:routeID', scheduleController.getSchedulesByRouteID);
scheduleRouter.get('/', scheduleController.getAllSchedules);
scheduleRouter.get('/driver/:driverID', scheduleController.getSchedulesByDriver);
scheduleRouter.post('/add', scheduleController.addNewSchedule);
scheduleRouter.put('/edit/:scheduleID',scheduleController.updateSchedule)
scheduleRouter.delete('/delete/:scheduleID',scheduleController.deleteSchedule)
module.exports = scheduleRouter;

