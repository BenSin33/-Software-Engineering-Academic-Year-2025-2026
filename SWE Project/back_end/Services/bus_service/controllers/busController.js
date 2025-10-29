const busQueries = require('../db/queries/busQueries');

// ===================================
// BUS CONTROLLERS
// ===================================

async function getAllBuses(req, res) {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      minCapacity: req.query.minCapacity,
      maxCapacity: req.query.maxCapacity,
      minFuel: req.query.minFuel,
      route: req.query.route
    };
    
    const pagination = {
      limit: req.query.limit || 1000,
      offset: req.query.offset || 0
    };

    const result = await busQueries.findAll(filters, pagination);

    res.json({
      success: true,
      data: result.buses,
      total: result.total
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getBusById(req, res) {
  try {
    const busId = req.params.id;
    const bus = await busQueries.findById(busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.json({
      success: true,
      data: bus
    });
  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getBusStats(req, res) {
  try {
    const stats = await busQueries.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function createBus(req, res) {
  try {
    const busData = req.body;

    // Check if bus ID already exists
    const exists = await busQueries.exists(busData.BusID, busData.PlateNumber);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Bus ID or Plate Number already exists'
      });
    }

    await busQueries.create(busData);

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: { BusID: busData.BusID }
    });
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateBus(req, res) {
  try {
    const busId = req.params.id;
    const updateData = req.body;

    // Check if bus exists
    const existingBus = await busQueries.findById(busId);
    if (!existingBus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await busQueries.update(busId, updateData);

    res.json({
      success: true,
      message: 'Bus updated successfully'
    });
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function deleteBus(req, res) {
  try {
    const busId = req.params.id;

    // Check if bus exists
    const existingBus = await busQueries.findById(busId);
    if (!existingBus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await busQueries.delete(busId);

    res.json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getAllBuses,
  getBusById,
  getBusStats,
  createBus,
  updateBus,
  deleteBus
};
