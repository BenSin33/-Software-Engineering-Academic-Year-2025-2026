const express = require("express");
const router = express.Router();
// router.post('/drivingCar/gap-time/levels',async (req,res)=>{
//   const startTimeArr = req.body;
  
// })
router.post('/drivingCar', async (req, res) => {
  const orsApiKey = `${process.env.ORS_FIRST_API}`
  const orsSecond = `${process.env.ORS_SECOND_API}`
  const routes = req.body;
  try {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${orsSecond}`,
        },
        body: JSON.stringify(routes),
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Lỗi ORS: ${text}`);
    }

    const data = await response.json();
    res.json(data); // gửi dữ liệu ORS về cho client

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lấy đường đi' });
  }
});

module.exports = router;
