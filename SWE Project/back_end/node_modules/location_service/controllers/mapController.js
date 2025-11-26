
const axios = require('axios');

exports.checkGeofence = async (req, res) => {
  try {

    return res.status(501).json({
      success: false,
      message: 'Chức năng này không khả dụng. Bảng "geofences" không tồn tại trong schema mới.'
    });

  } catch (error) {
    console.error('Error checking geofence:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra geofence',
      error: error.message
    });
  }
};

exports.getMapTileUrl = async (req, res) => {

};

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {

}

const ORS_API_KEY = process.env.ORS_API_KEY;
const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY;

const ORS_BASE_URL = 'https://api.openrouteservice.org';
const MAPTILER_BASE_URL = 'https://api.maptiler.com';

exports.calculateRoute = async (req, res) => {
  try {
    const { start, end, profile = 'driving-car' } = req.query;

    // Validate input
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tọa độ start hoặc end. Format: "lng,lat"'
      });
    }

    // Parse coordinates
    const startCoords = start.split(',').map(Number);
    const endCoords = end.split(',').map(Number);

    // Call OpenRouteService API
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/directions/${profile}`,
      {
        coordinates: [startCoords, endCoords]
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const route = response.data.routes[0];

    res.json({
      success: true,
      data: {
        distance: route.summary.distance, // meters
        duration: route.summary.duration, // seconds
        geometry: route.geometry, // GeoJSON LineString
        coordinates: route.geometry.coordinates,
        bbox: response.data.bbox
      }
    });
  } catch (error) {
    console.error('Error calculating route:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính toán route',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

exports.optimizeRoute = async (req, res) => {
  try {
    // SỬA: Thêm kiểm tra req.body và req.body.stops
    if (!req.body || !req.body.stops) {
      return res.status(400).json({
        success: false,
        message: "Thiếu 'stops' trong body của request. Format: { \"stops\": [[lng, lat], ...] }"
      });
    }

    const { stops, profile = 'driving-car' } = req.body;

    if (!Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cần ít nhất 2 điểm dừng. Format: [[lng, lat], ...]'
      });
    }

    // Call OpenRouteService Optimization API
    const response = await axios.post(
      `${ORS_BASE_URL}/optimization`,
      {
        jobs: stops.slice(1).map((coord, idx) => ({
          id: idx + 1,
          location: coord
        })),
        vehicles: [{
          id: 1,
          profile: profile,
          start: stops[0],
          end: stops[0]
        }]
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error optimizing route:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tối ưu route',
      error: error.response?.data?.error?.message || error.message
    });
  }
};


exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu địa chỉ cần tìm'
      });
    }

    // Call MapTiler Geocoding API
    const response = await axios.get(
      `${MAPTILER_BASE_URL}/geocoding/${encodeURIComponent(address)}.json`,
      {
        params: {
          key: MAPTILER_API_KEY,
          limit: 5
        }
      }
    );

    res.json({
      success: true,
      data: response.data.features.map(f => ({
        name: f.place_name,
        coordinates: f.geometry.coordinates, // [lng, lat]
        bbox: f.bbox
      }))
    });
  } catch (error) {
    console.error('Error geocoding address:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi geocoding',
      error: error.message
    });
  }
};

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tọa độ lat hoặc lng'
      });
    }

    // Call MapTiler Reverse Geocoding API
    const response = await axios.get(
      `${MAPTILER_BASE_URL}/geocoding/${lng},${lat}.json`,
      {
        params: {
          key: MAPTILER_API_KEY
        }
      }
    );

    const feature = response.data.features[0];

    res.json({
      success: true,
      data: {
        address: feature?.place_name || 'Unknown location',
        coordinates: feature?.geometry.coordinates || [lng, lat]
      }
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi reverse geocoding',
      error: error.message
    });
  }
};

exports.calculateDistance = async (req, res) => {
  try {
    const { sources, destinations, profile = 'driving-car' } = req.body;

    if (!sources || !destinations) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu sources hoặc destinations'
      });
    }

    // Call OpenRouteService Matrix API
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/matrix/${profile}`,
      {
        locations: [...sources, ...destinations],
        sources: sources.map((_, idx) => idx),
        destinations: destinations.map((_, idx) => sources.length + idx)
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      data: {
        distances: response.data.distances, // meters
        durations: response.data.durations // seconds
      }
    });
  } catch (error) {
    console.error('Error calculating distance:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính khoảng cách',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

exports.getMapTileUrl = async (req, res) => {
  try {
    const { style = 'streets-v2' } = req.query;

    const tileUrl = `${MAPTILER_BASE_URL}/maps/${style}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;

    res.json({
      success: true,
      data: {
        tileUrl,
        attribution: '© MapTiler © OpenStreetMap contributors',
        maxZoom: 19
      }
    });
    
  } catch (error) {
    console.error('Error getting tile URL:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tile URL',
      error: error.message
    });
  }
};


// Haversine formula để tính khoảng cách giữa 2 điểm GPS
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}