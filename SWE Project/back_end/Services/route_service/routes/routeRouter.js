const { Router } = require('express');
const routeController = require('../controllers/routeController');
const routeRouter = Router();


// Các route khác
routeRouter.get('/', routeController.getAllRoutes);
routeRouter.post('/add', routeController.addNewRoute);
routeRouter.post('/edit/:routeID',routeController.updateCurrentRoute)
routeRouter.post('/delete/:routeID',routeController.deleteRoute)
module.exports = routeRouter;
