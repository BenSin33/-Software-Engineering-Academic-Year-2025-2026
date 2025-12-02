const {Router} = require('express');
const scheduleRouter = Router();
const scheduleController = require('../controllers/scheduleController.js');
const authMiddleware = require('../middleware/auth.middleware');

scheduleRouter.get('/driver/my-schedules', authMiddleware.verifyToken, scheduleController.getMySchedules);

scheduleRouter.get('/driver/:driverID', scheduleController.getSchedulesByDriverID); 

scheduleRouter.get('/', scheduleController.getAllSchedules);

scheduleRouter.post('/add', scheduleController.addNewSchedule);
scheduleRouter.put('/edit/:scheduleID', scheduleController.updateSchedule);
scheduleRouter.delete('/delete/:scheduleID', scheduleController.deleteSchedule);

// Route có tham số (Đặt cuối cùng để tránh bị nhận nhầm)
scheduleRouter.get('/:routeID', scheduleController.getSchedulesByRouteID);

scheduleRouter.patch('/status/:scheduleID', scheduleController.updateStatus);

module.exports = scheduleRouter;