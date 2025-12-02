const express = require("express");
const router = express.Router();
const { callService } = require("../services/callService.js");

// 1. Tính toán lộ trình (Routing)
// GET /Map/route?start=...&end=...
router.get("/route", async (req, res) => {
  try {
    // Forward toàn bộ query params (start, end) sang location_service
    const result = await callService(
        "location_service", 
        `/Map/route?start=${req.query.start}&end=${req.query.end}`, 
        "GET"
    );
    res.json(result);
  } catch (err) {
    console.error("Gateway Map Error:", err.message);
    res.status(500).json({ message: "Lỗi tính toán lộ trình" });
  }
});

// 2. Các API khác nếu cần (Geocoding, Tiles...)
router.get("/geocode", async (req, res) => {
    try {
        const result = await callService("location_service", `/Map/geocode?address=${encodeURIComponent(req.query.address)}`, "GET");
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Geocoding" });
    }
});

module.exports = router;