const express = require('express');
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser, handleValidation } = require('../middleware/validateUser');
const router = express.Router();

// Lấy tất cả user
router.get('/', userController.getAllUsers);

// Lấy thông tin 1 user theo UserID
router.get('/:id', userController.getUserById);

// CRUD
router.post('/', validateCreateUser, handleValidation, userController.createUser);
router.put('/:id', validateUpdateUser, handleValidation, userController.updateUser);
router.delete('/:id', userController.deleteUser);

// THÊM 2 ROUTE NHẬN ĐỒNG BỘ
router.post('/sync', userController.syncUser);
router.delete('/sync/:id', userController.syncDeleteUser);

module.exports = router;
