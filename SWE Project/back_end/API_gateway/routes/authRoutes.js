const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/login', async (req, res) => {
  try {
    const response = await axios.post('http://auth_service:5010/api/auth/login', req.body);
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Lỗi gọi auth_service';
    res.status(status).json({ error: message });
  }
});


module.exports = router;