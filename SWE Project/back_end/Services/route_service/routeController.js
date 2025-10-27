import axios from "axios";
import { getAllRoutes } from "./routeModel.js";

const COLORS = ["#FF0000", "#4285F4", "#34A853"];

export async function getRoutes(req, res) {
  try {
    const routes = await getAllRoutes();
    const ORS_API_KEY = process.env.ORS_API_KEY;

    const results = await Promise.all(
      routes.map(async (route, index) => {
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
          id: route.RouteID,
          name: route.RouteName,
          color: COLORS[index % COLORS.length],
          coordinates: coords,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể lấy dữ liệu tuyến đường" });
  }
}
