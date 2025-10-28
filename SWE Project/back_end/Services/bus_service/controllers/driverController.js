const driverQueries = require('../db/queries/driverQueries');

// ===================================
// DRIVER CONTROLLERS
// ===================================

async function getAllDrivers(req, res) {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      Fullname: req.query.Fullname,
      PhoneNumber: req.query.PhoneNumber,
      Email: req.query.Email
    };
    
    const pagination = {
      limit: req.query.limit || 100,
      offset: req.query.offset || 0
    };

    const result = await driverQueries.findAll(filters, pagination);

    res.json({
      success: true,
      data: result.drivers,
      total: result.total
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getDriverById(req, res) {
  try {
    const driverId = parseInt(req.params.id);
    const driver = await driverQueries.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getDriverByUserId(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const driver = await driverQueries.findByUserId(userId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver by user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getDriverStats(req, res) {
  try {
    const stats = await driverQueries.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching driver statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function createDriver(req, res) {
  try {
    const driverData = req.body;

    // Check if user ID already exists
    const exists = await driverQueries.existsByUserId(driverData.UserID);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Driver with this UserID already exists'
      });
    }

    await driverQueries.create(driverData);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully'
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateDriver(req, res) {
  try {
    const driverId = parseInt(req.params.id);
    const updateData = req.body;

    // Check if driver exists
    const existingDriver = await driverQueries.findById(driverId);
    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    await driverQueries.update(driverId, updateData);

    res.json({
      success: true,
      message: 'Driver updated successfully'
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateDriverStatus(req, res) {
  try {
    const driverId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['active', 'rest'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if driver exists
    const existingDriver = await driverQueries.findById(driverId);
    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    await driverQueries.updateStatus(driverId, status);

    res.json({
      success: true,
      message: 'Driver status updated successfully'
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function deleteDriver(req, res) {
  try {
    const driverId = parseInt(req.params.id);

    // Check if driver exists
    const existingDriver = await driverQueries.findById(driverId);
    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if driver is assigned to a bus
    const isAssigned = await driverQueries.isAssignedToBus(driverId);
    if (isAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver. Driver is currently assigned to a bus.'
      });
    }

    await driverQueries.delete(driverId);

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getAllDrivers,
  getDriverById,
  getDriverByUserId,
  getDriverStats,
  createDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver
};
