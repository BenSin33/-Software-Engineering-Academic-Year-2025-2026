const express = require('express');
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser, handleValidation } = require('../middleware/validateUser');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateCreateUser, handleValidation, userController.createUser);
router.put('/:id', validateUpdateUser, handleValidation, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;