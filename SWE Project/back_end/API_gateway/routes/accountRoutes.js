const express = require('express');
const router = express.Router();
const { callService } = require('../services/callService');

router.post('/', async (req, res) => {
  try {
    const { username, roleID,Password } = req.body;
    const response = await callService('auth_service','/api/accounts/user','POST',req.body);
    console.log('navi')
    console.log('res: ',response)
    res.json(response);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Lỗi gọi auth_service';
    res.status(status).json({ error: message });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('alk')
    const response = await callService('auth_service','/api/accounts/users','GET');
    console.log('navi')
    console.log('res: ',response)
    res.json(response);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Lỗi gọi auth_service';
    res.status(status).json({ error: message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const { userName, roleID,password } = req.body;
    console.log('rbo: ',req.body)
    console.log('alk')
    const response = await callService('auth_service',`/api/accounts/user/${id}`,'PUT',req.body);
    console.log('navi')
    console.log('res: ',response)
    res.json(response);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Lỗi gọi auth_service';
    res.status(status).json({ error: message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const {id} = req.params;
    console.log('alk:v',id)
    const response = await callService('auth_service',`/api/accounts/user/${id}`,'DELETE');
    console.log('navi')
    console.log('res: ',response)
    res.json(response);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Lỗi gọi auth_service';
    res.status(status).json({ error: message });
  }
});
module.exports = router