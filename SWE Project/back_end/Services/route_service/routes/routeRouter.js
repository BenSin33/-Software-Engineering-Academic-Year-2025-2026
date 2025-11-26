const { Router } = require('express');
const { 
  getAllRoutes, 
  addNewRoute, 
  updateCurrentRoute, 
  deleteRoute, 
  getRoute 
} = require('../controllers/routeController');

const routeRouter = Router();

// GET route theo ID - phải nằm TRƯỚC route GET tất cả (/:RouteID sẽ match /add)
routeRouter.get('/:RouteID', getRoute);

// GET tất cả routes
routeRouter.get('/', getAllRoutes);

// POST thêm route mới
routeRouter.post('/add', addNewRoute);

// POST cập nhật route
routeRouter.post('/edit/:routeID', updateCurrentRoute);

// POST xóa route
routeRouter.post('/delete/:routeID', deleteRoute);

module.exports = routeRouter;
