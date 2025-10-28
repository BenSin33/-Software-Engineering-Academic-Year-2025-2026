const mapService = require('../utils/mapService');

// ===================================
// MAP CONTROLLERS
// ===================================

async function calculateRoute(req, res) {
  try {
    const { startLat, startLng, endLat, endLng, profile } = req.body;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: startLat, startLng, endLat, endLng'
      });
    }

    const route = await mapService.calculateRoute(
      parseFloat(startLat),
      parseFloat(startLng),
      parseFloat(endLat),
      parseFloat(endLng),
      profile
    );

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate route'
    });
  }
}

async function calculateMultiPointRoute(req, res) {
  try {
    const { waypoints, profile } = req.body;

    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'waypoints must be an array with at least 2 points'
      });
    }

    const route = await mapService.calculateMultiPointRoute(waypoints, profile);

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error calculating multi-point route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate multi-point route'
    });
  }
}

async function calculateDistanceMatrix(req, res) {
  try {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations) || locations.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'locations must be an array with at least 2 points'
      });
    }

    const matrix = await mapService.calculateDistanceMatrix(locations);

    res.json({
      success: true,
      data: matrix
    });
  } catch (error) {
    console.error('Error calculating distance matrix:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate distance matrix'
    });
  }
}

async function optimizeRoute(req, res) {
  try {
    const { stops, start, end } = req.body;

    if (!stops || !Array.isArray(stops) || !start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: stops (array), start (object), end (object)'
      });
    }

    const optimized = await mapService.optimizeRoute(stops, start, end);

    res.json({
      success: true,
      data: optimized
    });
  } catch (error) {
    console.error('Error optimizing route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to optimize route'
    });
  }
}

async function geocodeAddress(req, res) {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: address'
      });
    }

    const results = await mapService.geocodeAddress(address);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to geocode address'
    });
  }
}

async function reverseGeocode(req, res) {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: lat, lng'
      });
    }

    const result = await mapService.reverseGeocode(parseFloat(lat), parseFloat(lng));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reverse geocode'
    });
  }
}

async function calculateIsochrone(req, res) {
  try {
    const { lat, lng, ranges, rangeType } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: lat, lng'
      });
    }

    const isochrone = await mapService.calculateIsochrone(
      parseFloat(lat),
      parseFloat(lng),
      ranges || [600, 1200, 1800],
      rangeType || 'time'
    );

    res.json({
      success: true,
      data: isochrone
    });
  } catch (error) {
    console.error('Error calculating isochrone:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate isochrone'
    });
  }
}

async function getMapConfig(req, res) {
  try {
    res.json({
      success: true,
      data: {
        maptiler: {
          apiKey: process.env.MAPTILER_API_KEY,
          tileUrl: mapService.getMapTilerTileUrl('streets-v2'),
          styleUrl: mapService.getMapTilerStyleUrl('streets-v2'),
          styles: [
            'basic-v2',
            'streets-v2',
            'satellite-v2',
            'hybrid-v2',
            'outdoor-v2',
            'winter-v2'
          ]
        },
        openrouteservice: {
          profiles: [
            'driving-car',
            'driving-hgv',
            'cycling-regular',
            'foot-walking'
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error getting map config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get map config'
    });
  }
}

module.exports = {
  calculateRoute,
  calculateMultiPointRoute,
  calculateDistanceMatrix,
  optimizeRoute,
  geocodeAddress,
  reverseGeocode,
  calculateIsochrone,
  getMapConfig
};