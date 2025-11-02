const busQueries = require('../db/queries/busQueries');
const eventPublisher = require('../events/eventPublisher');

// ===================================
// BUS CONTROLLERS
// ===================================

async function getAllBuses(req, res) {
  try {
    const {
      status,
      search,
      minCapacity,
      maxCapacity,
      minFuel,
      route,
      limit = 100,
      offset = 0
    } = req.query;

    const filters = { status, search, minCapacity, maxCapacity, minFuel, route };
    const pagination = { limit: parseInt(limit), offset: parseInt(offset) };

    const result = await busQueries.findAll(filters, pagination);

    res.json({
      success: true,
      data: result.buses,
      pagination: {
        total: result.total,
        limit: pagination.limit,
        offset: pagination.offset
      }
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

async function getBusStatistics(req, res) {
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

    if (!busData || !busData.BusID || !busData.PlateNumber || !busData.Capacity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: BusID, PlateNumber, Capacity'
      });
    }

    const exists = await busQueries.exists(busData.BusID, busData.PlateNumber);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Bus already exists (by BusID or PlateNumber)'
      });
    }

    await busQueries.create(busData);

    await eventPublisher.publish('bus.created', {
      busId: busData.BusID,
      licensePlate: busData.PlateNumber,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: { id: busData.BusID }
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

    const result = await busQueries.update(busId, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Publish event
    await eventPublisher.publish('bus.updated', {
      busId,
      changes: updateData,
      timestamp: new Date().toISOString()
    });

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

async function updateBusStatus(req, res) {
  try {
    const busId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['running', 'waiting', 'maintenance', 'ready'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get current bus data
    const existingBus = await busQueries.findById(busId);
    if (!existingBus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await busQueries.updateStatus(busId, status);

    // Publish event
    await eventPublisher.publish('bus.status_changed', {
      busId,
      oldStatus: existingBus.Status,
      newStatus: status,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Bus status updated successfully'
    });
  } catch (error) {
    console.error('Error updating bus status:', error);
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

    const result = await busQueries.delete(busId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await eventPublisher.publish('bus.deleted', {
      busId,
      timestamp: new Date().toISOString()
    });

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

async function getBusEvents(req, res) {
  try {
    // Events store is not implemented in current queries layer
    res.json({ success: true, data: [], count: 0 });
  } catch (error) {
    console.error('Error fetching bus events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getBusesByRoute(req, res) {
  try {
    const routeId = req.params.routeId;
    const buses = await busQueries.findByRoute(routeId);

    res.json({
      success: true,
      data: buses,
      count: buses.length
    });
  } catch (error) {
    console.error('Error fetching buses by route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getBusesNeedingMaintenance(req, res) {
  try {
    const buses = await busQueries.findByStatus('maintenance');

    res.json({
      success: true,
      data: buses,
      count: buses.length
    });
  } catch (error) {
    console.error('Error fetching buses needing maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getAvailableBuses(req, res) {
  try {
    const buses = await busQueries.findAvailable();

    res.json({
      success: true,
      data: buses,
      count: buses.length
    });
  } catch (error) {
    console.error('Error fetching available buses:', error);
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
  getBusStatistics,
  createBus,
  updateBus,
  updateBusStatus,
  deleteBus,
  getBusEvents,
  getBusesByRoute,
  getBusesNeedingMaintenance,
  getAvailableBuses
};