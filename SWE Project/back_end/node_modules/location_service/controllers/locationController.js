const pool = require('../db/pool');
const geoCoding = require("../utils/geoCoding");

// Tạo hàm delay để tránh bị giới hạn tốc độ API
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// exports.getCoordinatesArray=async (req, res)=> {
//   const addressArr = req.body; // Mảng địa chỉ gửi từ frontend
//   const coordinates = [];

//   console.log("📍 Nhận được danh sách địa chỉ:", addressArr);

//   if (!Array.isArray(addressArr) || addressArr.length === 0) {
//     return res.status(400).json({
//       message: "Dữ liệu đầu vào không hợp lệ. Cần truyền vào mảng các địa chỉ.",
//     });
//   }

//   try {
//     for (const address of addressArr) {
//       console.log(`🔍 Đang xử lý: ${address}`);
//       const coordinate = await geoCoding.getCoordinatesOSM(address);

//       if (coordinate) {
//         console.log(` Thành công: ${address} →`, coordinate);
//         coordinates.push(coordinate);
//       } else {
//         console.log(` Không tìm thấy tọa độ cho: ${address}`);
//       }

//       // Bắt buộc delay để tránh vượt giới hạn rate limit của OpenCage
//       await delay(1000);
//     }

//     console.log("📦 Tất cả tọa độ:", coordinates);

//     return res.status(200).json({
//       message: "Chuyển tọa độ thành công",
//       coordinates,
//     });
//   } catch (err) {
//     console.error("💥 Lỗi khi chuyển đổi tọa độ:", err);
//     return res.status(500).json({
//       message: "Lỗi server khi chuyển địa chỉ sang tọa độ",
//     });
//   }
// }

exports.getCoordinatesArray = async (req, res) => {
  const addressArr = req.body; // Mảng địa chỉ gửi từ frontend
  console.log('addressArr: ',addressArr)
  const coordinates = [];

  console.log("📍 Nhận được danh sách địa chỉ:", addressArr);

  if (!Array.isArray(addressArr) || addressArr.length === 0) {
    return res.status(400).json({
      message: "Dữ liệu đầu vào không hợp lệ. Cần truyền vào mảng các địa chỉ.",
    });
  }

  try {
    for (const item of addressArr) {
      let address;
      let newEntry = {};

      if (typeof item === 'string') {
        // Start hoặc end location
        address = item;
        newEntry.type = coordinates.length === 0 ? 'start' : 'end';
        newEntry.address = address;
      } else if (typeof item === 'object' && item.pickUpPoint) {
        // Các điểm trung gian của học sinh
        console.log("item hợp lệ: ",item)
        address = item.pickUpPoint;
        newEntry.type = 'student';
        newEntry.studentID = item.StudentID;
        newEntry.pickUpPoint = address;
      } else {
        console.log("⚠️ Bỏ qua item không hợp lệ:", item);
        continue; // skip nếu không hợp lệ
      }

      console.log(`🔍 Đang xử lý: ${address}`);
      const coordinate = await geoCoding.getCoordinatesOSM(address);

      if (coordinate) {
        console.log(` ✅ Thành công: ${address} →`, coordinate);
        newEntry.lat = coordinate.lat;
        newEntry.lng = coordinate.lng;
        coordinates.push(newEntry);
      } else {
        console.log(` ❌ Không tìm thấy tọa độ cho: ${address}`);
      }

      // Delay để tránh vượt giới hạn rate limit
      await delay(1000);
    }

    console.log("📦 Tất cả tọa độ:", coordinates);

    return res.status(200).json({
      message: "Chuyển tọa độ thành công",
      coordinates,
    });
  } catch (err) {
    console.error("💥 Lỗi khi chuyển đổi tọa độ:", err);
    return res.status(500).json({
      message: "Lỗi server khi chuyển địa chỉ sang tọa độ",
    });
  }
};

// exports.getAllCurrentLocations = async (req, res) => {
//   try {
//     const [locations] = await pool.query(
//       `SELECT 
//         TrackingID,
//         BusID,
//         RouteID,
//         Latitude,
//         Longitude,
//         Speed,
//         Status,
//         Timestamp
//        FROM Tracking
//        ORDER BY BusID`
//     );

//     res.json({
//       success: true,
//       data: locations,
//       count: locations.length
//     });
//   } catch (error) {
//     console.error('Error getting all locations:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy vị trí xe',
//       error: error.message
//     });
//   }
// };

// exports.getBusLocation = async (req, res) => {
//   try {
//     const { busId } = req.params;

//     const [locations] = await pool.query(
//       `SELECT 
//         TrackingID,
//         BusID,
//         RouteID,
//         Latitude,
//         Longitude,
//         Speed,
//         Status,
//         Timestamp
//        FROM Tracking 
//        WHERE BusID = ?`,
//       [busId]
//     );

//     if (locations.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy vị trí xe'
//       });
//     }

//     res.json({
//       success: true,
//       data: locations[0]
//     });
//   } catch (error) {
//     console.error('Error getting bus location:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy vị trí xe',
//       error: error.message
//     });
//   }
// };

// exports.getLocationsByRoute = async (req, res) => {
//   try {
//     const { routeId } = req.params;

//     const [locations] = await pool.query(
//       `SELECT 
//         TrackingID,
//         BusID,
//         RouteID,
//         Latitude,
//         Longitude,
//         Speed,
//         Status,
//         Timestamp
//        FROM Tracking
//        WHERE RouteID = ?
//        ORDER BY BusID`,
//       [routeId]
//     );

//     res.json({
//       success: true,
//       data: locations,
//       count: locations.length
//     });
//   } catch (error) {
//     console.error('Error getting locations by route:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy vị trí xe theo tuyến',
//       error: error.message
//     });
//   }
// };

// exports.updateLocation = async (req, res) => {
//   try {
//     const { busId } = req.params;
//     const { 
//       latitude, 
//       longitude, 
//       speed,
//       routeId 
//     } = req.body;

//     // Validate
//     if (!latitude || !longitude) {
//       return res.status(400).json({
//         success: false,
//         message: 'Thiếu thông tin vị trí (latitude, longitude)'
//       });
//     }

//     const currentSpeed = speed || 0;
//     const currentStatus = currentSpeed > 0 ? 'moving' : 'stopped';
//     const currentRouteId = routeId || null;

//     // BƯỚC 1: Ghi vào bảng lịch sử ('LocationHistory')
//     await pool.query(
//       `INSERT INTO LocationHistory 
//        (BusID, RouteID, Latitude, Longitude, Speed, RecordedAt) 
//        VALUES (?, ?, ?, ?, ?, NOW())`,
//       [
//         busId, 
//         currentRouteId,
//         latitude, 
//         longitude, 
//         currentSpeed
//       ]
//     );

//     await pool.query(
//       `INSERT INTO Tracking
//        (BusID, RouteID, Latitude, Longitude, Speed, Status, Timestamp)
//        VALUES (?, ?, ?, ?, ?, ?, NOW())
//        ON DUPLICATE KEY UPDATE
//        RouteID = VALUES(RouteID),
//        Latitude = VALUES(Latitude),
//        Longitude = VALUES(Longitude),
//        Speed = VALUES(Speed),
//        Status = VALUES(Status),
//        Timestamp = NOW()`,
//        [
//         busId,
//         currentRouteId,
//         latitude,
//         longitude,
//         currentSpeed,
//         currentStatus
//        ]
//     );

//     res.json({
//       success: true,
//       message: 'Cập nhật vị trí thành công'
//     });
//   } catch (error) {
//     console.error('Error updating location:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi cập nhật vị trí',
//       error: error.message
//     });
//   }
// };

// exports.getLocationHistory = async (req, res) => {
//   try {
//     const { busId } = req.params;
//     const { startDate, endDate, limit = 100 } = req.query;

//     let query = `
//       SELECT 
//         HistoryID,
//         BusID,
//         RouteID,
//         Latitude,
//         Longitude,
//         Speed,
//         RecordedAt
//       FROM LocationHistory 
//       WHERE BusID = ?
//     `;
//     let params = [busId];

//     // Filter theo thời gian
//     if (startDate) {
//       query += ' AND RecordedAt >= ?';
//       params.push(startDate);
//     }

//     if (endDate) {
//       query += ' AND RecordedAt <= ?';
//       params.push(endDate);
//     }

//     query += ' ORDER BY RecordedAt DESC LIMIT ?';
//     params.push(parseInt(limit));

//     const [history] = await pool.query(query, params);

//     res.json({
//       success: true,
//       data: history,
//       count: history.length
//     });
//   } catch (error) {
//     console.error('Error getting location history:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy lịch sử vị trí',
//       error: error.message
//     });
//   }
// };

// exports.deleteTracking = async (req, res) => {
//   try {
//     const { busId } = req.params;

//     // Xóa khỏi bảng hiện tại
//     const [trackResult] = await pool.query(
//       'DELETE FROM Tracking WHERE BusID = ?',
//       [busId]
//     );
    
//     // Xóa khỏi bảng lịch sử
//     const [histResult] = await pool.query(
//       'DELETE FROM LocationHistory WHERE BusID = ?',
//       [busId]
//     );

//     const totalDeleted = trackResult.affectedRows + histResult.affectedRows;

//     if (totalDeleted === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy tracking của xe'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Xóa tracking thành công',
//       deletedRecords: totalDeleted
//     });
//   } catch (error) {
//     console.error('Error deleting tracking:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi xóa tracking',
//       error: error.message
//     });
//   }
// };

// exports.getLocationStats = async (req, res) => {
//   try {
//     // Lấy thống kê chung từ bảng lịch sử
//     const [stats] = await pool.query(`
//       SELECT 
//         COUNT(DISTINCT BusID) as totalBuses,
//         COUNT(*) as totalRecords,
//         AVG(Speed) as avgSpeed,
//         MAX(Speed) as maxSpeed,
//         MIN(RecordedAt) as oldestRecord,
//         MAX(RecordedAt) as newestRecord
//       FROM LocationHistory
//     `);

//     // Lấy thống kê trạng thái hiện tại từ bảng 'Tracking'
//     const [speedStats] = await pool.query(`
//       SELECT 
//         SUM(CASE WHEN Status = 'moving' THEN 1 ELSE 0 END) as movingBuses,
//         SUM(CASE WHEN Status = 'stopped' OR Status = 'idle' THEN 1 ELSE 0 END) as stoppedBuses
//       FROM Tracking
//     `);

//     res.json({
//       success: true,
//       data: {
//         ...stats[0],
//         ...speedStats[0]
//       }
//     });
//   } catch (error) {
//     console.error('Error getting location stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy thống kê',
//       error: error.message
//     });
//   }
// };

// exports.getBusAlerts = async (req, res) => {
//   try {
//     // Bảng 'location_alerts' không tồn tại trong schema 'db_location.sql' mới.
//     return res.status(501).json({
//       success: false,
//       message: 'Chức năng này không khả dụng. Bảng "location_alerts" không tồn tại trong schema mới.'
//     });


//   } catch (error) {
//     console.error('Error getting bus alerts:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy cảnh báo',
//       error: error.message
//     });
//   }
// };

// ==========================================
// 1. API CHO TÀI XẾ: Cập nhật vị trí
exports.updateLocation = async (req, res) => {
  try {
    const { scheduleId } = req.params; // Lấy ScheduleID từ URL
    const { latitude, longitude, speed } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Thiếu tọa độ' });
    }

    const currentSpeed = speed || 0;
    const currentStatus = currentSpeed > 0 ? 'moving' : 'stopped';

    // A. Lưu vào lịch sử (location_history)
    await pool.query(
      `INSERT INTO location_history (ScheduleID, Latitude, Longitude, Speed, RecordedAt) 
       VALUES (?, ?, ?, ?, NOW())`,
      [scheduleId, latitude, longitude, currentSpeed]
    );

    // B. Cập nhật vị trí hiện tại (tracking) - Dùng INSERT ON DUPLICATE UPDATE
    // Nếu chuyến xe này chưa có trong bảng tracking thì thêm mới.
    // Nếu đã có rồi thì cập nhật tọa độ mới nhất.
    await pool.query(
      `INSERT INTO tracking (ScheduleID, Latitude, Longitude, Speed, Status, Timestamp)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
       Latitude = VALUES(Latitude),
       Longitude = VALUES(Longitude),
       Speed = VALUES(Speed),
       Status = VALUES(Status),
       Timestamp = NOW()`,
       [scheduleId, latitude, longitude, currentSpeed, currentStatus]
    );

    res.json({ success: true, message: 'Updated' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. API CHO ADMIN: Lấy vị trí mới nhất
exports.getLatestLocation = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Chỉ cần query bảng tracking nhỏ gọn
    const [rows] = await pool.query(
      `SELECT Latitude, Longitude, Speed, Status, Timestamp 
       FROM tracking 
       WHERE ScheduleID = ?`,
      [scheduleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No location data' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error getting location:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

