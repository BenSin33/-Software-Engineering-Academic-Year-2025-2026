const maintenanceQueries = require('../db/maintenanceQueries');
const eventPublisher = require('../events/eventPublisher');

// ===================================
// MAINTENANCE CONTROLLERS
// ===================================

async function getMaintenanceHistory(req, res) {
  try {
    const busId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;

    const history = await maintenanceQueries.getMaintenanceHistory(busId, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getAllMaintenanceRecords(req, res) {
  try {
    const filters = req.query;
    const records = await maintenanceQueries.getAllMaintenanceRecords(filters);

    res.json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function addMaintenanceRecord(req, res) {
  try {
    const busId = req.params.id;
    const maintenanceData = {
      bus_id: busId,
      ...req.body
    };

    // Validation
    if (!maintenanceData.maintenance_type || !maintenanceData.maintenance_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: maintenance_type, maintenance_date'
      });
    }

    await maintenanceQueries.addMaintenanceRecord(maintenanceData);

    // Publish event
    await eventPublisher.publish('bus.maintenance_scheduled', {
      busId,
      maintenanceType: maintenanceData.maintenance_type,
      maintenanceDate: maintenanceData.maintenance_date,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record added successfully'
    });
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateMaintenanceRecord(req, res) {
  try {
    const recordId = req.params.recordId;
    const updateData = req.body;

    await maintenanceQueries.updateMaintenanceRecord(recordId, updateData);

    res.json({
      success: true,
      message: 'Maintenance record updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function deleteMaintenanceRecord(req, res) {
  try {
    const recordId = req.params.recordId;

    const result = await maintenanceQueries.deleteMaintenanceRecord(recordId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getMaintenanceStatistics(req, res) {
  try {
    const stats = await maintenanceQueries.getMaintenanceStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching maintenance statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getUpcomingMaintenance(req, res) {
  try {
    const upcoming = await maintenanceQueries.getUpcomingMaintenance();

    res.json({
      success: true,
      data: upcoming,
      count: upcoming.length
    });
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getOverdueMaintenance(req, res) {
  try {
    const overdue = await maintenanceQueries.getOverdueMaintenance();

    res.json({
      success: true,
      data: overdue,
      count: overdue.length
    });
  } catch (error) {
    console.error('Error fetching overdue maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getMaintenanceHistory,
  getAllMaintenanceRecords,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceStatistics,
  getUpcomingMaintenance,
  getOverdueMaintenance
};