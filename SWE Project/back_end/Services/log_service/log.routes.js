const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');

// Ghi log
router.post('/logs', logController.create);
router.post('/logs/batch', logController.createBatch);

// Tìm kiếm log
router.get('/logs', logController.find);

// Thống kê
router.get('/logs/stats', logController.getStats);
router.get('/logs/error-rate', logController.getErrorRate);
router.get('/logs/services', logController.getServices);
router.get('/logs/hourly', logController.getHourlyDistribution);
router.get('/logs/top-errors', logController.getTopErrors);

// Quản lý dữ liệu
router.delete('/logs/cleanup', logController.cleanup);
router.get('/logs/export', logController.exportLogs);

// Log sự kiện người dùng
router.post('/logs/login', logController.logLogin);
router.post('/logs/logout', logController.logLogout);
router.post('/logs/user-update', logController.logUserUpdate);

module.exports = router;
