const express = require('express');
const parentController = require('../controllers/parentController');
const router = express.Router();
const authorize = require('../middleware/auth.middleware');

// GET thông tin 1 phụ huynh theo UserID
router.get("/user/:userId", parentController.getParentByUserId);

// Lấy tất cả phụ huynh
router.get("/", parentController.getAllParents);

// CRUD
router.post('/', parentController.createParent);
router.get('/:id', parentController.getParentById);
router.put('/:id', parentController.updateParent);
router.delete('/:id', parentController.deleteParent);

//THÊM 2 ROUTE NHẬN ĐỒNG BỘ
router.post("/sync", parentController.syncParent);
router.delete("/sync/:id", parentController.syncDeleteParent);

module.exports = router;
