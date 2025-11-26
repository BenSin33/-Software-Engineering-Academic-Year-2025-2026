const locationQueries = require('../db/locationQueries');
const eventPublisher = require('../events/eventPublisher');
const driverQueries = require('../db/queries/driverQueries');

// ===================================
// LOCATION TRACKING CONTROLLERS
// ===================================

async function getLocationTracking(req, res) {
  try {
    const busId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;

    const locations = await locationQueries.getLocationTracking(busId, limit);

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching location tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getLocationHistory(req, res) {
  try {
    const busId = req.params.id;
    const { startDate, endDate } = req.query;

    const locations = await locationQueries.getLocationHistory(busId, startDate, endDate);

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function addLocationTracking(req, res) {
  try {
    const busId = req.params.id;
    const locationData = {
      bus_id: busId,
      ...req.body
    };

    // Validation
    if (!locationData.latitude || !locationData.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude'
      });
    }

    await locationQueries.addLocationTracking(locationData);

    // Publish event (for real-time tracking)
    await eventPublisher.publish('bus.location_updated', {
      busId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      locationName: locationData.location_name,
      speed: locationData.speed,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Location recorded successfully'
    });
  } catch (error) {
    console.error('Error recording location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getCurrentLocations(req, res) {
  try {
    const locations = await locationQueries.getCurrentLocations();

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching current locations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getBusRoute(req, res) {
  try {
    const busId = req.params.id;
    const route = await locationQueries.getBusRoute(busId);

    res.json({
      success: true,
      data: route,
      count: route.length
    });
  } catch (error) {
    console.error('Error fetching bus route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getLocationStatistics(req, res) {
  try {
    const busId = req.params.id;
    const stats = await locationQueries.getLocationStatistics(busId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching location statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  // Driver CRUD + stats
  async getAllDrivers(req, res) {
    try {
      const { status, search, Fullname, PhoneNumber, Email, limit = 100, offset = 0 } = req.query;
      const filters = { status, search, Fullname, PhoneNumber, Email };
      const pagination = { limit: parseInt(limit), offset: parseInt(offset) };
      const result = await driverQueries.findAll(filters, pagination);
      res.json({
        success: true,
        data: result.drivers,
        pagination: { total: result.total, limit: pagination.limit, offset: pagination.offset }
      });
    } catch (error) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  async getDriverById(req, res) {
    try {
      const driverId = req.params.id;
      const driver = await driverQueries.findById(driverId);
      if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
      res.json({ success: true, data: driver });
    } catch (error) {
      console.error('Error fetching driver:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  async getDriverByUserId(req, res) {
    try {
      const userId = req.params.userId;
      const driver = await driverQueries.findByUserId(userId);
      if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
      res.json({ success: true, data: driver });
    } catch (error) {
      console.error('Error fetching driver by userId:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  async createDriver(req, res) {
    try {
      // Accept both PascalCase (from sync) and camelCase (if any)
      const { DriverID, UserID, Fullname, PhoneNumber, Email, Status = 'active' } = req.body || {};

      if (!UserID || !Fullname || !PhoneNumber || !Email) {
        return res.status(400).json({ success: false, message: 'Missing required fields: UserID, Fullname, PhoneNumber, Email' });
      }

      // If DriverID is provided (sync from user_service), check if it exists
      if (DriverID) {
        const exists = await driverQueries.exists(DriverID);
        if (exists) {
          // Idempotency: if already exists, update it instead of failing
          await driverQueries.update(DriverID, { Fullname, PhoneNumber, Email, Status });
          return res.status(200).json({ success: true, message: 'Driver synced (updated) successfully' });
        }
      }

      const existsUser = await driverQueries.existsByUserId(UserID);
      if (existsUser) {
        return res.status(409).json({ success: false, message: 'Driver already exists for this UserID' });
      }

      await driverQueries.create({ DriverID, UserID, Fullname, PhoneNumber, Email, Status });
      res.status(201).json({ success: true, message: 'Driver created successfully' });
    } catch (error) {
      console.error('Error creating driver:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  async updateDriver(req, res) {
    try {
      const driverId = req.params.id;
      const updates = req.body || {};
      const existing = await driverQueries.findById(driverId);
      if (!existing) return res.status(404).json({ success: false, message: 'Driver not found' });
      const result = await driverQueries.update(driverId, updates);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Driver not found' });
      res.json({ success: true, message: 'Driver updated successfully' });
    } catch (error) {
      console.error('Error updating driver:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  async updateDriverStatus(req, res) {
    try {
      const driverId = req.params.id;
      const { status } = req.body || {};
      if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
      const existing = await driverQueries.findById(driverId);
      if (!existing) return res.status(404).json({ success: false, message: 'Driver not found' });
      await driverQueries.updateStatus(driverId, status);
      res.json({ success: true, message: 'Driver status updated successfully' });
    } catch (error) {
      console.error('Error updating driver status:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  async deleteDriver(req, res) {
    try {
      const driverId = req.params.id;
      const result = await driverQueries.delete(driverId);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Driver not found' });
      res.json({ success: true, message: 'Driver deleted successfully' });
    } catch (error) {
      console.error('Error deleting driver:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  async getDriverStats(req, res) {
    try {
      const stats = await driverQueries.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  // Location endpoints
  getLocationTracking,
  getLocationHistory,
  addLocationTracking,
  getCurrentLocations,
  getBusRoute,
  getLocationStatistics
};