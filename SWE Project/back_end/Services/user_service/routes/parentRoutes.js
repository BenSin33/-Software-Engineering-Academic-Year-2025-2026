const express = require('express');
const controller = require('../controllers/parentController');
const router = express.Router();

router.post('/', controller.createParent);
router.get('/:id', controller.getParentById);
router.put('/:id', controller.updateParent);
router.delete('/:id', controller.deleteParent);

module.exports = router;