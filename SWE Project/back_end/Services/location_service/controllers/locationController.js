
const pool = require('../db/pool');

exports.getAllCurrentLocations = async (req, res) => {
  try {
    const [locations] = await pool.query(
      `SELECT 
        TrackingID,
        BusID,
        RouteID,
        Latitude,
        Longitude,
        Speed,
        Status,
        Timestamp
       FROM Tracking
       ORDER BY BusID`
    );

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error getting all locations:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy vị trí xe',
      error: error.message
    });
  }
};

exports.getBusLocation = async (req, res) => {
  try {
    const { busId } = req.params;

    const [locations] = await pool.query(
      `SELECT 
        TrackingID,
        BusID,
        RouteID,
        Latitude,
        Longitude,
        Speed,
        Status,
        Timestamp
       FROM Tracking 
       WHERE BusID = ?`,
      [busId]
    );

    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vị trí xe'
      });
    }

    res.json({
      success: true,
      data: locations[0]
    });
  } catch (error) {
    console.error('Error getting bus location:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy vị trí xe',
      error: error.message
    });
  }
};

exports.getLocationsByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const [locations] = await pool.query(
      `SELECT 
        TrackingID,
        BusID,
        RouteID,
        Latitude,
        Longitude,
        Speed,
        Status,
        Timestamp
       FROM Tracking
       WHERE RouteID = ?
       ORDER BY BusID`,
      [routeId]
    );

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error getting locations by route:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy vị trí xe theo tuyến',
      error: error.message
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { busId } = req.params;
    const { 
      latitude, 
      longitude, 
      speed,
      routeId 
    } = req.body;

    // Validate
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin vị trí (latitude, longitude)'
      });
    }

    const currentSpeed = speed || 0;
    const currentStatus = currentSpeed > 0 ? 'moving' : 'stopped';
    const currentRouteId = routeId || null;

    // BƯỚC 1: Ghi vào bảng lịch sử ('LocationHistory')
    await pool.query(
      `INSERT INTO LocationHistory 
       (BusID, RouteID, Latitude, Longitude, Speed, RecordedAt) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        busId, 
        currentRouteId,
        latitude, 
        longitude, 
        currentSpeed
      ]
    );

    await pool.query(
      `INSERT INTO Tracking
       (BusID, RouteID, Latitude, Longitude, Speed, Status, Timestamp)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
       RouteID = VALUES(RouteID),
       Latitude = VALUES(Latitude),
       Longitude = VALUES(Longitude),
       Speed = VALUES(Speed),
       Status = VALUES(Status),
       Timestamp = NOW()`,
       [
        busId,
        currentRouteId,
        latitude,
        longitude,
        currentSpeed,
        currentStatus
       ]
    );

    res.json({
      success: true,
      message: 'Cập nhật vị trí thành công'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật vị trí',
      error: error.message
    });
  }
};

exports.getLocationHistory = async (req, res) => {
  try {
    const { busId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    let query = `
      SELECT 
        HistoryID,
        BusID,
        RouteID,
        Latitude,
        Longitude,
        Speed,
        RecordedAt
      FROM LocationHistory 
      WHERE BusID = ?
    `;
    let params = [busId];

    // Filter theo thời gian
    if (startDate) {
      query += ' AND RecordedAt >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND RecordedAt <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY RecordedAt DESC LIMIT ?';
    params.push(parseInt(limit));

    const [history] = await pool.query(query, params);

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error getting location history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử vị trí',
      error: error.message
    });
  }
};
exports.deleteTracking = async (req, res) => {
  try {
    const { busId } = req.params;

    // Xóa khỏi bảng hiện tại
    const [trackResult] = await pool.query(
      'DELETE FROM Tracking WHERE BusID = ?',
      [busId]
    );
    
    // Xóa khỏi bảng lịch sử
    const [histResult] = await pool.query(
      'DELETE FROM LocationHistory WHERE BusID = ?',
      [busId]
    );

    const totalDeleted = trackResult.affectedRows + histResult.affectedRows;

    if (totalDeleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tracking của xe'
      });
    }

    res.json({
      success: true,
      message: 'Xóa tracking thành công',
      deletedRecords: totalDeleted
    });
  } catch (error) {
    console.error('Error deleting tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tracking',
      error: error.message
    });
  }
};

exports.getLocationStats = async (req, res) => {
  try {
    // Lấy thống kê chung từ bảng lịch sử
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT BusID) as totalBuses,
        COUNT(*) as totalRecords,
        AVG(Speed) as avgSpeed,
        MAX(Speed) as maxSpeed,
        MIN(RecordedAt) as oldestRecord,
        MAX(RecordedAt) as newestRecord
      FROM LocationHistory
    `);

    // Lấy thống kê trạng thái hiện tại từ bảng 'Tracking'
    const [speedStats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN Status = 'moving' THEN 1 ELSE 0 END) as movingBuses,
        SUM(CASE WHEN Status = 'stopped' OR Status = 'idle' THEN 1 ELSE 0 END) as stoppedBuses
      FROM Tracking
    `);

    res.json({
      success: true,
      data: {
        ...stats[0],
        ...speedStats[0]
      }
    });
  } catch (error) {
    console.error('Error getting location stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

exports.getBusAlerts = async (req, res) => {
  try {
    // Bảng 'location_alerts' không tồn tại trong schema 'db_location.sql' mới.
    return res.status(501).json({
      success: false,
      message: 'Chức năng này không khả dụng. Bảng "location_alerts" không tồn tại trong schema mới.'
    });


  } catch (error) {
    console.error('Error getting bus alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cảnh báo',
      error: error.message
    });
  }
};