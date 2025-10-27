const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { validateMaintenanceRecord } = require('../middleware/validation');

// ===================================
// MAINTENANCE ROUTES
// ===================================

// Get all maintenance records with filters
router.get('/', maintenanceController.getAllMaintenanceRecords);

// Get maintenance statistics
router.get('/stats', maintenanceController.getMaintenanceStatistics);

// Get upcoming maintenance
router.get('/upcoming', maintenanceController.getUpcomingMaintenance);

// Get overdue maintenance
router.get('/overdue', maintenanceController.getOverdueMaintenance);

// Get maintenance history for specific bus
router.get('/bus/:id', maintenanceController.getMaintenanceHistory);

// Add maintenance record for specific bus (with validation)
router.post('/bus/:id', validateMaintenanceRecord, maintenanceController.addMaintenanceRecord);

// Update maintenance record
router.put('/:recordId', maintenanceController.updateMaintenanceRecord);

// Delete maintenance record
router.delete('/:recordId', maintenanceController.deleteMaintenanceRecord);

module.exports = router;