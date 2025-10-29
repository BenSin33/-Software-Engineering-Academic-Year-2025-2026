const express = require('express');
const controller = require('../controllers/driverController');
const router = express.Router();

router.post('/', controller.createDriver);
router.get('/:id', controller.getDriverById);
router.put('/:id', controller.updateDriver);
router.delete('/:id', controller.deleteDriver);

module.exports = router;