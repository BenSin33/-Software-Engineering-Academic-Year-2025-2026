const express = require("express");
const router = express.Router();
// router.post('/drivingCar/gap-time/levels',async (req,res)=>{
//   const startTimeArr = req.body;
  
// })
router.post('/drivingCar', async (req, res) => {
  const orsApiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkxZTJkMDY4NjI0ODQ1NjZiNTdkNTU5ZmQ0OGRlMWY2IiwiaCI6Im11cm11cjY0In0=';
  const orsSecond = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjdiYzYxOTcxZTBjZjRjMjA5NmY3YjgzOWY1YWZjYzFiIiwiaCI6Im11cm11cjY0In0='
  const routes = req.body;
  console.log('not: ',routes);
  try {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${orsApiKey}`,
        },
        body: JSON.stringify(routes),
      }
    );
    console.log('đaylâ: ',response)
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Lỗi ORS: ${text}`);
    }

    const data = await response.json();
    console.log('nusa: ',data)
    res.json(data); // gửi dữ liệu ORS về cho client

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lấy đường đi' });
  }
});

module.exports = router;
