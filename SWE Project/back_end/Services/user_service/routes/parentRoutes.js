const express = require('express');
const parentController = require('../controllers/parentController'); // ✅ import đúng tên
const router = express.Router();
const authorize = require('../middleware/auth.middleware');

// Chỉ cho phép phụ huynh truy cập thông tin của chính họ
router.get("/parents/user/:userId", authorize(["R003"]), parentController.getParentByUserId);

// Admin có thể xem tất cả phụ huynh
router.get("/parents", authorize(["R001"]), parentController.getAllParents);

// CRUD routes
router.post('/', parentController.createParent);
router.get('/', parentController.getAllParents);
router.get('/:id', parentController.getParentById);
router.get('/user/:userId', parentController.getParentByUserId);
router.put('/:id', parentController.updateParent);
router.delete('/:id', parentController.deleteParent);

module.exports = router;
