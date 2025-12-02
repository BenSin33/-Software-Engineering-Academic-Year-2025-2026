USE location_service_db;

-- 1. BẢNG TRACKING (Chỉ lưu vị trí hiện tại mới nhất của mỗi chuyến xe)
-- Mục đích: Admin load bản đồ sẽ query bảng này, rất nhẹ và nhanh.
CREATE TABLE IF NOT EXISTS tracking (
    TrackingID INT AUTO_INCREMENT PRIMARY KEY,
    ScheduleID VARCHAR(50) UNIQUE NOT NULL, -- Khóa chính là chuyến xe (VD: SCH-001)
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    Speed INT DEFAULT 0,
    Status ENUM('moving', 'stopped', 'idle') DEFAULT 'moving',
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (ScheduleID)
);

-- 2. BẢNG LỊCH SỬ DI CHUYỂN (Lưu tất cả các điểm để vẽ lại đường đi sau này)
CREATE TABLE IF NOT EXISTS location_history (
    HistoryID INT AUTO_INCREMENT PRIMARY KEY,
    ScheduleID VARCHAR(50) NOT NULL,
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    Speed INT DEFAULT 0,
    RecordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (ScheduleID),
    INDEX (RecordedAt)
);