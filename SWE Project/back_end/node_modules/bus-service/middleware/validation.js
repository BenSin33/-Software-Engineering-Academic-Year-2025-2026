// ===================================
// VALIDATION MIDDLEWARE
// ===================================

function validateBusCreation(req, res, next) {
  const { id, license_plate, model, capacity, year } = req.body;

  const errors = [];

  if (!id || typeof id !== 'string' || id.trim() === '') {
    errors.push('id is required and must be a non-empty string');
  }

  if (!license_plate || typeof license_plate !== 'string' || license_plate.trim() === '') {
    errors.push('license_plate is required and must be a non-empty string');
  }

  if (!model || typeof model !== 'string' || model.trim() === '') {
    errors.push('model is required and must be a non-empty string');
  }

  if (!capacity || typeof capacity !== 'number' || capacity <= 0) {
    errors.push('capacity is required and must be a positive number');
  }

  if (year && (typeof year !== 'number' || year < 1900 || year > new Date().getFullYear() + 1)) {
    errors.push(`year must be between 1900 and ${new Date().getFullYear() + 1}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

function validateBusUpdate(req, res, next) {
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  const errors = [];

  if (updateData.capacity !== undefined) {
    if (typeof updateData.capacity !== 'number' || updateData.capacity <= 0) {
      errors.push('capacity must be a positive number');
    }
  }

  if (updateData.fuel_level !== undefined) {
    if (typeof updateData.fuel_level !== 'number' || updateData.fuel_level < 0 || updateData.fuel_level > 100) {
      errors.push('fuel_level must be between 0 and 100');
    }
  }

  if (updateData.status !== undefined) {
    const validStatuses = ['running', 'waiting', 'maintenance', 'ready'];
    if (!validStatuses.includes(updateData.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (updateData.year !== undefined) {
    if (typeof updateData.year !== 'number' || updateData.year < 1900 || updateData.year > new Date().getFullYear() + 1) {
      errors.push(`year must be between 1900 and ${new Date().getFullYear() + 1}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

function validateMaintenanceRecord(req, res, next) {
  const { maintenance_type, maintenance_date } = req.body;

  const errors = [];

  const validTypes = ['routine', 'repair', 'inspection', 'emergency'];
  if (!maintenance_type || !validTypes.includes(maintenance_type)) {
    errors.push(`maintenance_type is required and must be one of: ${validTypes.join(', ')}`);
  }

  if (!maintenance_date) {
    errors.push('maintenance_date is required');
  } else {
    const date = new Date(maintenance_date);
    if (isNaN(date.getTime())) {
      errors.push('maintenance_date must be a valid date');
    }
  }

  if (req.body.cost !== undefined) {
    if (typeof req.body.cost !== 'number' || req.body.cost < 0) {
      errors.push('cost must be a non-negative number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

function validateLocationTracking(req, res, next) {
  const { latitude, longitude } = req.body;

  const errors = [];

  if (latitude === undefined || latitude === null) {
    errors.push('latitude is required');
  } else if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    errors.push('latitude must be a number between -90 and 90');
  }

  if (longitude === undefined || longitude === null) {
    errors.push('longitude is required');
  } else if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    errors.push('longitude must be a number between -180 and 180');
  }

  if (req.body.speed !== undefined) {
    if (typeof req.body.speed !== 'number' || req.body.speed < 0) {
      errors.push('speed must be a non-negative number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

module.exports = {
  validateBusCreation,
  validateBusUpdate,
  validateMaintenanceRecord,
  validateLocationTracking
};