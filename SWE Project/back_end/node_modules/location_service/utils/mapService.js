const axios = require('axios');

// ===================================
// MAP SERVICE - OpenRouteService & MapTiler
// ===================================

const ORS_API_KEY = process.env.ORS_API_KEY;
const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org';

// ===================================
// ROUTING - OpenRouteService
// ===================================

/**
 * Tính route giữa 2 điểm
 * @param {number} startLat - Vĩ độ điểm bắt đầu
 * @param {number} startLng - Kinh độ điểm bắt đầu
 * @param {number} endLat - Vĩ độ điểm kết thúc
 * @param {number} endLng - Kinh độ điểm kết thúc
 * @param {string} profile - driving-car, driving-hgv, cycling-regular, foot-walking
 */
async function calculateRoute(startLat, startLng, endLat, endLng, profile = 'driving-car') {
  try {
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/directions/${profile}`,
      {
        coordinates: [
          [startLng, startLat],
          [endLng, endLat]
        ],
        instructions: true,
        elevation: false,
        preference: 'fastest'
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const route = response.data.routes[0];
    
    return {
      distance: route.summary.distance, // meters
      duration: route.summary.duration, // seconds
      coordinates: route.geometry.coordinates, // Array of [lng, lat]
      instructions: route.segments[0].steps.map(step => ({
        instruction: step.instruction,
        distance: step.distance,
        duration: step.duration
      }))
    };
  } catch (error) {
    console.error('Error calculating route:', error.response?.data || error.message);
    throw new Error('Failed to calculate route');
  }
}

/**
 * Tính route đi qua nhiều điểm
 * @param {Array} waypoints - Array of {lat, lng}
 */
async function calculateMultiPointRoute(waypoints, profile = 'driving-car') {
  try {
    const coordinates = waypoints.map(point => [point.lng, point.lat]);
    
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/directions/${profile}`,
      {
        coordinates: coordinates,
        instructions: true,
        elevation: false,
        preference: 'fastest'
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const route = response.data.routes[0];
    
    return {
      distance: route.summary.distance,
      duration: route.summary.duration,
      coordinates: route.geometry.coordinates,
      segments: route.segments.map(segment => ({
        distance: segment.distance,
        duration: segment.duration,
        steps: segment.steps.map(step => ({
          instruction: step.instruction,
          distance: step.distance,
          duration: step.duration
        }))
      }))
    };
  } catch (error) {
    console.error('Error calculating multi-point route:', error.response?.data || error.message);
    throw new Error('Failed to calculate multi-point route');
  }
}

/**
 * Tính ma trận khoảng cách giữa nhiều điểm
 * @param {Array} locations - Array of {lat, lng}
 */
async function calculateDistanceMatrix(locations) {
  try {
    const coordinates = locations.map(point => [point.lng, point.lat]);
    
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/matrix/driving-car`,
      {
        locations: coordinates,
        metrics: ['distance', 'duration']
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      distances: response.data.distances, // Matrix of distances in meters
      durations: response.data.durations  // Matrix of durations in seconds
    };
  } catch (error) {
    console.error('Error calculating distance matrix:', error.response?.data || error.message);
    throw new Error('Failed to calculate distance matrix');
  }
}

/**
 * Tối ưu thứ tự điểm dừng (Traveling Salesman Problem)
 * @param {Array} stops - Array of {lat, lng}
 * @param {Object} start - {lat, lng} điểm bắt đầu
 * @param {Object} end - {lat, lng} điểm kết thúc
 */
async function optimizeRoute(stops, start, end) {
  try {
    const jobs = stops.map((stop, index) => ({
      id: index + 1,
      location: [stop.lng, stop.lat],
      service: 120 // 2 minutes at each stop
    }));

    const vehicles = [{
      id: 1,
      profile: 'driving-car',
      start: [start.lng, start.lat],
      end: [end.lng, end.lat]
    }];

    const response = await axios.post(
      `${ORS_BASE_URL}/optimization`,
      {
        jobs: jobs,
        vehicles: vehicles
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      optimizedOrder: response.data.routes[0].steps
        .filter(step => step.type === 'job')
        .map(step => step.job),
      totalDistance: response.data.routes[0].distance,
      totalDuration: response.data.routes[0].duration,
      geometry: response.data.routes[0].geometry
    };
  } catch (error) {
    console.error('Error optimizing route:', error.response?.data || error.message);
    throw new Error('Failed to optimize route');
  }
}

// ===================================
// GEOCODING - OpenRouteService
// ===================================

/**
 * Chuyển địa chỉ thành tọa độ (Forward Geocoding)
 * @param {string} address - Địa chỉ cần tìm
 */
async function geocodeAddress(address) {
  try {
    const response = await axios.get(
      `${ORS_BASE_URL}/geocode/search`,
      {
        params: {
          api_key: ORS_API_KEY,
          text: address,
          size: 5 // Trả về top 5 kết quả
        }
      }
    );

    return response.data.features.map(feature => ({
      name: feature.properties.name,
      label: feature.properties.label,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      confidence: feature.properties.confidence
    }));
  } catch (error) {
    console.error('Error geocoding address:', error.response?.data || error.message);
    throw new Error('Failed to geocode address');
  }
}

/**
 * Chuyển tọa độ thành địa chỉ (Reverse Geocoding)
 * @param {number} lat - Vĩ độ
 * @param {number} lng - Kinh độ
 */
async function reverseGeocode(lat, lng) {
  try {
    const response = await axios.get(
      `${ORS_BASE_URL}/geocode/reverse`,
      {
        params: {
          api_key: ORS_API_KEY,
          'point.lon': lng,
          'point.lat': lat,
          size: 1
        }
      }
    );

    const feature = response.data.features[0];
    return {
      name: feature.properties.name,
      label: feature.properties.label,
      street: feature.properties.street,
      locality: feature.properties.locality,
      region: feature.properties.region,
      country: feature.properties.country
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error.response?.data || error.message);
    throw new Error('Failed to reverse geocode');
  }
}

// ===================================
// ISOCHRONES - Vùng có thể đến trong thời gian cho trước
// ===================================

/**
 * Tính vùng có thể đến trong thời gian/khoảng cách cho trước
 * @param {number} lat - Vĩ độ điểm xuất phát
 * @param {number} lng - Kinh độ điểm xuất phát
 * @param {Array} ranges - Array of time in seconds or distance in meters
 * @param {string} rangeType - 'time' or 'distance'
 */
async function calculateIsochrone(lat, lng, ranges = [600, 1200, 1800], rangeType = 'time') {
  try {
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/isochrones/driving-car`,
      {
        locations: [[lng, lat]],
        range: ranges,
        range_type: rangeType,
        attributes: ['area', 'reachfactor']
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.features.map(feature => ({
      value: feature.properties.value,
      center: feature.properties.center,
      area: feature.properties.area,
      reachfactor: feature.properties.reachfactor,
      geometry: feature.geometry
    }));
  } catch (error) {
    console.error('Error calculating isochrone:', error.response?.data || error.message);
    throw new Error('Failed to calculate isochrone');
  }
}

// ===================================
// MAPTILER - Map Tiles
// ===================================

/**
 * Get MapTiler tile URL
 * @param {string} style - basic-v2, streets-v2, satellite-v2, hybrid-v2, etc.
 */
function getMapTilerTileUrl(style = 'streets-v2') {
  return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;
}

/**
 * Get MapTiler static map URL
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level (0-22)
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 */
function getMapTilerStaticMapUrl(lat, lng, zoom = 14, width = 800, height = 600) {
  return `https://api.maptiler.com/maps/streets-v2/static/${lng},${lat},${zoom}/${width}x${height}.png?key=${MAPTILER_API_KEY}`;
}

/**
 * Get MapTiler style JSON for custom styling
 * @param {string} style - Style name
 */
function getMapTilerStyleUrl(style = 'streets-v2') {
  return `https://api.maptiler.com/maps/${style}/style.json?key=${MAPTILER_API_KEY}`;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Tính khoảng cách giữa 2 điểm (Haversine formula)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Tính bearing (hướng) giữa 2 điểm
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;

  return bearing;
}

module.exports = {
  // Routing
  calculateRoute,
  calculateMultiPointRoute,
  calculateDistanceMatrix,
  optimizeRoute,
  
  // Geocoding
  geocodeAddress,
  reverseGeocode,
  
  // Isochrones
  calculateIsochrone,
  
  // MapTiler
  getMapTilerTileUrl,
  getMapTilerStaticMapUrl,
  getMapTilerStyleUrl,
  
  // Utilities
  calculateDistance,
  calculateBearing
};