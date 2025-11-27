const express = require('express');
const router = express.Router();
const { callService } = require('../services/callService');

router.post('/', async (req, res) => {
  try {
    const { username, roleId, password } = req.body;
    // Sửa: /api/accounts/user → /api/users
    console.log('vls: ',req.body)
    const response = await callService('user_service', '/api/users', 'POST', req.body);
    console.log('navi');
    console.log('res: ', response);
    res.json(response);
  } catch (err) {
    // Sửa: err.response → err.status và err.message
    const status = err.status || 500;
    const message = err.message || 'Lỗi gọi user_service';
    res.status(status).json({ error: message });
  }
});

router.get('/', async (req, res) => {
  try {
    const response = await callService('user_service', '/api/users', 'GET');
    res.json(response);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Lỗi gọi user_service';
    res.status(status).json({ error: message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, roleId, password } = req.body;
    console.log('rbo: ', req.body);
    console.log('alk');
    // Sửa: /api/accounts/user/${id} → /api/users/${id}
    const response = await callService('user_service', `/api/users/${id}`, 'PUT', req.body);
    console.log('navi');
    console.log('res: ', response);
    res.json(response);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Lỗi gọi user_service';
    res.status(status).json({ error: message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('alk:v', id);
    // Sửa: /api/accounts/user/${id} → /api/users/${id}
    const response = await callService('user_service', `/api/users/${id}`, 'DELETE');
    console.log('navi');
    console.log('res: ', response);
    res.json(response);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Lỗi gọi user_service';
    res.status(status).json({ error: message });
  }
});

module.exports = router;