const { Router } = require('express');
const locationController = require('../controllers/locationController.js');
const locationRouter = Router();
locationRouter.post('/coordinates',locationController.getCoordinatesArray);
module.exports=locationRouter
