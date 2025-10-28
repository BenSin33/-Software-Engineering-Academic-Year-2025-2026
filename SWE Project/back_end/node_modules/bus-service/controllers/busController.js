const busQueries = require('../db/busQueries');
const eventPublisher = require('../events/eventPublisher');

// ===================================
// BUS CONTROLLERS
// ===================================

async function getAllBuses(req, res) {
  try {
    const filters = req.query;
    const result = await busQueries.getAllBuses(filters);

    res.json({
      success: true,
      data: result.buses,
      pagination: result.pagination
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
    const bus = await busQueries.getBusById(busId);

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
    const stats = await busQueries.getBusStatistics();

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
    const existingBus = await busQueries.getBusById(busData.id);
    if (existingBus) {
      return res.status(409).json({
        success: false,
        message: 'Bus ID already exists'
      });
    }

    await busQueries.createBus(busData);

    // Log event
    await busQueries.logBusEvent(busData.id, 'created', {
      action: 'Bus created',
      busData
    });

    // Publish event to message queue
    await eventPublisher.publish('bus.created', {
      busId: busData.id,
      licensePlate: busData.license_plate,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: { id: busData.id }
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
    const existingBus = await busQueries.getBusById(busId);
    if (!existingBus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const result = await busQueries.updateBus(busId, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Log event
    await busQueries.logBusEvent(busId, 'updated', {
      action: 'Bus updated',
      changes: updateData
    });

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
    const existingBus = await busQueries.getBusById(busId);
    if (!existingBus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await busQueries.updateBusStatus(busId, status);

    // Log event
    await busQueries.logBusEvent(busId, 'status_changed', {
      action: 'Status changed',
      oldStatus: existingBus.status,
      newStatus: status
    });

    // Publish event
    await eventPublisher.publish('bus.status_changed', {
      busId,
      oldStatus: existingBus.status,
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

    const result = await busQueries.deleteBus(busId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Publish event
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
    const busId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;

    const events = await busQueries.getBusEvents(busId, limit);

    res.json({
      success: true,
      data: events,
      count: events.length
    });
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
    const buses = await busQueries.getBusesByRoute(routeId);

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
    const buses = await busQueries.getBusesNeedingMaintenance();

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
    const buses = await busQueries.getAvailableBuses();

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