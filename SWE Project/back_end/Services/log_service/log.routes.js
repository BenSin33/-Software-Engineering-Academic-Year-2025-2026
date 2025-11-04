const express = require('express');
const ctrl = require('./log.controller');
const router = express.Router();

router.get('/', ctrl.find);             // GET /logs
router.post('/', ctrl.createBatch);     // POST /logs
router.post('/single', ctrl.create);    // POST /logs/single
router.post('/login', ctrl.logLogin);   // POST /logs/login
router.post('/logout', ctrl.logLogout); // POST /logs/logout
router.post('/user-update', ctrl.logUserUpdate); // POST /logs/user-update

module.exports = router;
