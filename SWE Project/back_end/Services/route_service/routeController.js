const axios = require("axios");
const queries = require('./db/queries');
require('dotenv').config();

const COLORS = ["#FF0000", "#4285F4", "#34A853"];

async function getRoutes(req, res) {
  try {
    const routes = await queries.getRoutes();
    
    if (!routes || routes.length === 0) {
      return res.status(200).json({ routes: [] });
    }

    const ORS_API_KEY = process.env.ORS_API_KEY;

    // Nếu không có ORS API KEY, trả về dữ liệu cơ bản mà không cần geocoding
    if (!ORS_API_KEY) {
      console.warn("⚠️ ORS_API_KEY không được cấu hình, trả về dữ liệu cơ bản");
      const basicRoutes = routes.map((route, index) => ({
        RouteID: route.RouteID,
        DriverID: route.DriverID,
        BusID: route.BusID,
        RouteName: route.RouteName,
        StartLocation: route.StartLocation,
        EndLocation: route.EndLocation,
        color: COLORS[index % COLORS.length],
      }));
      return res.json({ routes: basicRoutes });
    }

    const results = await Promise.all(
      routes.map(async (route, index) => {
        try {
          const startRes = await axios.get(
            `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${route.StartLocation}`
          );
          const endRes = await axios.get(
            `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${route.EndLocation}`
          );

          const start = startRes.data.features[0].geometry.coordinates;
          const end = endRes.data.features[0].geometry.coordinates;

          const dirRes = await axios.get(
            `https://api.openrouteservice.org/v2/directions/driving-car`,
            { params: { api_key: ORS_API_KEY, start: `${start[0]},${start[1]}`, end: `${end[0]},${end[1]}` } }
          );

          const coords = dirRes.data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);

          return {
            RouteID: route.RouteID,
            DriverID: route.DriverID,
            BusID: route.BusID,
            RouteName: route.RouteName,
            StartLocation: route.StartLocation,
            EndLocation: route.EndLocation,
            color: COLORS[index % COLORS.length],
            coordinates: coords,
          };
        } catch (err) {
          console.warn(`⚠️ Lỗi khi geocoding route ${route.RouteID}:`, err.message);
          // Trả về dữ liệu cơ bản nếu geocoding thất bại
          return {
            RouteID: route.RouteID,
            DriverID: route.DriverID,
            BusID: route.BusID,
            RouteName: route.RouteName,
            StartLocation: route.StartLocation,
            EndLocation: route.EndLocation,
            color: COLORS[index % COLORS.length],
          };
        }
      })
    );

    res.json({ routes: results });
  } catch (err) {
    console.error("❌ Lỗi trong getRoutes:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu tuyến đường", message: err.message });
  }
}

module.exports = {
  getRoutes
};
