const express = require('express');
const controller = require('../controllers/parentController'); // 🔧 SỬA: import đúng controller
const router = express.Router();

// CRUD routes
router.post('/', controller.createParent);
router.get('/', controller.getAllParents); // 🔧 THÊM: lấy tất cả parents
router.get('/:id', controller.getParentById);
router.get('/user/:userId', controller.getParentByUserId); // 🔧 THÊM: lấy theo UserID
router.put('/:id', controller.updateParent);
router.delete('/:id', controller.deleteParent);

module.exports = router;