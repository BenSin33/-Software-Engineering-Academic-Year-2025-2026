-- ===================================
-- LOCATION SERVICE DATABASE (Microservices Architecture)
-- ===================================
-- Service này quản lý: Real-time GPS tracking, Routes, Geofences, Alerts
-- ===================================

CREATE DATABASE IF NOT EXISTS location_service_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE location_service_db;

-- ===================================
-- TABLE: bus_locations (Real-time GPS tracking)
-- Note: Không có FK tới buses vì nó ở Bus Service
-- Chỉ lưu bus_id như reference ID
-- ===================================
CREATE TABLE bus_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id VARCHAR(20) NOT NULL, -- Reference to Bus Service
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed INT DEFAULT 0,
    heading INT DEFAULT 0, -- Hướng di chuyển (0-360 độ)
    altitude INT DEFAULT 0, -- Độ cao (meters)
    accuracy INT DEFAULT 0, -- Độ chính xác GPS (meters)
    location_name VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bus_id (bus_id),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: routes (Tuyến đường)
-- ===================================
CREATE TABLE routes (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    distance DECIMAL(10, 2), -- Khoảng cách (km)
    estimated_duration INT, -- Thời gian ước tính (phút)
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: route_stops (Điểm dừng trên tuyến)
-- ===================================
CREATE TABLE route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id VARCHAR(20) NOT NULL,
    stop_name VARCHAR(255) NOT NULL,
    stop_order INT NOT NULL, -- Thứ tự điểm dừng
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    arrival_time TIME, -- Giờ đến dự kiến
    departure_time TIME, -- Giờ đi dự kiến
    wait_time INT DEFAULT 2, -- Thời gian chờ (phút)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id),
    INDEX idx_stop_order (stop_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: geofences (Vùng địa lý - cho cảnh báo)
-- ===================================
CREATE TABLE geofences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('school', 'pickup_point', 'danger_zone', 'service_area') NOT NULL,
    center_latitude DECIMAL(10, 8) NOT NULL,
    center_longitude DECIMAL(11, 8) NOT NULL,
    radius INT NOT NULL, -- Bán kính (meters)
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: pickup_dropoff_points (Điểm đón/trả học sinh)
-- ===================================
CREATE TABLE pickup_dropoff_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    point_name VARCHAR(255) NOT NULL,
    point_type ENUM('pickup', 'dropoff', 'both') DEFAULT 'both',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100),
    student_count INT DEFAULT 0, -- Số học sinh sử dụng điểm này
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_point_type (point_type),
    INDEX idx_status (status),
    INDEX idx_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: location_alerts (Cảnh báo vị trí)
-- ===================================
CREATE TABLE location_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id VARCHAR(20) NOT NULL, -- Reference to Bus Service
    alert_type ENUM('speeding', 'route_deviation', 'geofence_entry', 'geofence_exit', 'stopped_too_long') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    message TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_bus_id (bus_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_is_resolved (is_resolved),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- INSERT SAMPLE DATA - Routes
-- ===================================
INSERT INTO routes (id, name, description, start_point, end_point, distance, estimated_duration, status) VALUES
('ROUTE-001', 'Tuyến 1 - Q.5 - Q.3', 'Tuyến đón học sinh từ Q.5 đến Q.3', 'Nguyễn Văn Cừ, Q.5', 'Trường Tiểu học ABC, Q.3', 12.5, 45, 'active'),
('ROUTE-002', 'Tuyến 2 - Q.1 - Q.3', 'Tuyến đón học sinh từ Q.1 đến Q.3', 'Lê Lợi, Q.1', 'Trường Tiểu học ABC, Q.3', 8.3, 30, 'active'),
('ROUTE-003', 'Tuyến 3 - Q.10 - Q.3', 'Tuyến đón học sinh từ Q.10 đến Q.3', 'Cách Mạng Tháng 8, Q.10', 'Trường Tiểu học ABC, Q.3', 10.2, 40, 'active'),
('ROUTE-004', 'Tuyến 4 - Q.BT - Q.3', 'Tuyến đón học sinh từ Bình Thạnh đến Q.3', 'Điện Biên Phủ, Q.BT', 'Trường Tiểu học ABC, Q.3', 9.7, 35, 'active'),
('ROUTE-005', 'Tuyến 5 - Q.1 - Q.5', 'Tuyến đón học sinh từ Q.1 đến Q.5', 'Pasteur, Q.1', 'Trường Tiểu học XYZ, Q.5', 11.0, 42, 'active'),
('ROUTE-006', 'Tuyến 6 - Q.3 - Q.10', 'Tuyến đón học sinh từ Q.3 đến Q.10', 'Hai Bà Trưng, Q.3', 'Trường Tiểu học DEF, Q.10', 9.5, 38, 'active');

-- ===================================
-- INSERT SAMPLE DATA - Route Stops
-- ===================================
INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude, address, arrival_time, departure_time, wait_time) VALUES
-- Tuyến 1
('ROUTE-001', 'Điểm đón 1 - Nguyễn Văn Cừ', 1, 10.7543, 106.6621, '123 Nguyễn Văn Cừ, Q.5', '06:30:00', '06:32:00', 2),
('ROUTE-001', 'Điểm đón 2 - An Dương Vương', 2, 10.7612, 106.6701, '456 An Dương Vương, Q.5', '06:35:00', '06:37:00', 2),
('ROUTE-001', 'Điểm đón 3 - Võ Văn Tần', 3, 10.7769, 106.7009, '789 Võ Văn Tần, Q.3', '06:45:00', '06:47:00', 2),
('ROUTE-001', 'Trường Tiểu học ABC', 4, 10.7823, 106.6945, 'Trường Tiểu học ABC, Q.3', '06:55:00', '07:00:00', 5),

-- Tuyến 2
('ROUTE-002', 'Điểm đón 1 - Lê Lợi', 1, 10.7754, 106.7007, '234 Lê Lợi, Q.1', '06:35:00', '06:37:00', 2),
('ROUTE-002', 'Điểm đón 2 - Hai Bà Trưng', 2, 10.7789, 106.6987, '567 Hai Bà Trưng, Q.3', '06:42:00', '06:44:00', 2),
('ROUTE-002', 'Trường Tiểu học ABC', 3, 10.7823, 106.6945, 'Trường Tiểu học ABC, Q.3', '06:52:00', '07:00:00', 5),

-- Tuyến 3
('ROUTE-003', 'Điểm đón 1 - Cách Mạng T8', 1, 10.7734, 106.6589, '987 Cách Mạng Tháng 8, Q.10', '06:28:00', '06:30:00', 2),
('ROUTE-003', 'Điểm đón 2 - Trần Hưng Đạo', 2, 10.7756, 106.6834, '234 Trần Hưng Đạo, Q.1', '06:38:00', '06:40:00', 2),
('ROUTE-003', 'Trường Tiểu học ABC', 3, 10.7823, 106.6945, 'Trường Tiểu học ABC, Q.3', '06:50:00', '07:00:00', 5),

-- Tuyến 4
('ROUTE-004', 'Điểm đón 1 - Điện Biên Phủ', 1, 10.7989, 106.7034, '654 Điện Biên Phủ, Q.BT', '06:32:00', '06:34:00', 2),
('ROUTE-004', 'Điểm đón 2 - Pasteur', 2, 10.7799, 106.6950, '321 Pasteur, Q.1', '06:40:00', '06:42:00', 2),
('ROUTE-004', 'Trường Tiểu học ABC', 3, 10.7823, 106.6945, 'Trường Tiểu học ABC, Q.3', '06:52:00', '07:00:00', 5);

-- ===================================
-- INSERT SAMPLE DATA - Pickup/Dropoff Points
-- ===================================
INSERT INTO pickup_dropoff_points (point_name, point_type, latitude, longitude, address, district, student_count, status) VALUES
('Điểm đón Nguyễn Văn Cừ', 'pickup', 10.7543, 106.6621, '123 Nguyễn Văn Cừ, Q.5', 'Quận 5', 15, 'active'),
('Điểm đón Lê Lợi', 'pickup', 10.7754, 106.7007, '234 Lê Lợi, Q.1', 'Quận 1', 20, 'active'),
('Điểm đón Võ Văn Tần', 'pickup', 10.7769, 106.7009, '789 Võ Văn Tần, Q.3', 'Quận 3', 18, 'active'),
('Điểm đón Pasteur', 'pickup', 10.7799, 106.6950, '321 Pasteur, Q.1', 'Quận 1', 12, 'active'),
('Điểm đón Điện Biên Phủ', 'pickup', 10.7989, 106.7034, '654 Điện Biên Phủ, Q.BT', 'Bình Thạnh', 22, 'active'),
('Điểm đón Cách Mạng T8', 'pickup', 10.7734, 106.6589, '987 Cách Mạng Tháng 8, Q.10', 'Quận 10', 16, 'active'),
('Điểm đón Trần Hưng Đạo', 'pickup', 10.7756, 106.6834, '234 Trần Hưng Đạo, Q.1', 'Quận 1', 14, 'active'),
('Điểm đón Hai Bà Trưng', 'pickup', 10.7789, 106.6987, '567 Hai Bà Trưng, Q.3', 'Quận 3', 19, 'active'),
('Điểm đón An Dương Vương', 'pickup', 10.7612, 106.6701, '456 An Dương Vương, Q.5', 'Quận 5', 17, 'active');

-- ===================================
-- INSERT SAMPLE DATA - Geofences
-- ===================================
INSERT INTO geofences (name, type, center_latitude, center_longitude, radius, description, status) VALUES
('Trường Tiểu học ABC', 'school', 10.7823, 106.6945, 500, 'Vùng an toàn xung quanh trường', 'active'),
('Khu dân cư Q.5', 'pickup_point', 10.7543, 106.6621, 300, 'Khu vực đón học sinh Q.5', 'active'),
('Khu dân cư Q.1', 'pickup_point', 10.7754, 106.7007, 300, 'Khu vực đón học sinh Q.1', 'active'),
('Công trình đường Võ Văn Tần', 'danger_zone', 10.7689, 106.6823, 200, 'Khu vực thi công đường, cần giảm tốc', 'active'),
('Khu dân cư Bình Thạnh', 'pickup_point', 10.7989, 106.7034, 350, 'Khu vực đón học sinh Bình Thạnh', 'active'),
('Khu dân cư Q.10', 'service_area', 10.7734, 106.6589, 400, 'Khu vực phục vụ Q.10', 'active');

-- ===================================
-- INSERT SAMPLE DATA - Bus Locations (Real-time)
-- ===================================
INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading, altitude, accuracy, location_name, recorded_at) VALUES
-- BUS-01 - Đang chạy tuyến 1
('BUS-01', 10.7769, 106.7009, 42, 135, 5, 10, 'Võ Văn Tần, Q.3', NOW() - INTERVAL 1 MINUTE),
('BUS-01', 10.7780, 106.6995, 40, 130, 5, 10, 'Gần Hai Bà Trưng, Q.3', NOW()),

-- BUS-03 - Đang chạy tuyến 2
('BUS-03', 10.7754, 106.7007, 38, 90, 5, 12, 'Lê Lợi, Q.1', NOW() - INTERVAL 2 MINUTE),
('BUS-03', 10.7770, 106.7000, 40, 95, 5, 12, 'Gần trường', NOW()),

-- BUS-05 - Đang chạy tuyến 3
('BUS-05', 10.7734, 106.6589, 35, 180, 5, 8, 'Cách Mạng Tháng 8, Q.10', NOW() - INTERVAL 3 MINUTE),
('BUS-05', 10.7745, 106.6700, 38, 175, 5, 8, 'Trần Hưng Đạo, Q.1', NOW()),

-- BUS-07 - Đang ở bãi đỗ
('BUS-07', 10.7823, 106.6945, 0, 0, 5, 15, 'Bãi đỗ trường', NOW() - INTERVAL 10 MINUTE);

-- ===================================
-- INSERT SAMPLE DATA - Location Alerts
-- ===================================
INSERT INTO location_alerts (bus_id, alert_type, severity, message, latitude, longitude, is_resolved, created_at) VALUES
('BUS-01', 'speeding', 'medium', 'Xe vượt quá tốc độ cho phép (55 km/h)', 10.7769, 106.7009, FALSE, NOW() - INTERVAL 5 MINUTE),
('BUS-03', 'stopped_too_long', 'low', 'Xe dừng quá lâu tại điểm (10 phút)', 10.7754, 106.7007, TRUE, NOW() - INTERVAL 30 MINUTE),
('BUS-05', 'route_deviation', 'high', 'Xe đi lệch khỏi tuyến đường đã định', 10.7734, 106.6589, FALSE, NOW() - INTERVAL 15 MINUTE),
('BUS-01', 'geofence_entry', 'low', 'Xe đã vào vùng trường học', 10.7823, 106.6945, TRUE, NOW() - INTERVAL 60 MINUTE);

-- ===================================
-- VIEWS - Để dễ query
-- ===================================

-- View: Current location of all buses (latest position)
CREATE OR REPLACE VIEW current_bus_locations AS
SELECT 
    bl.*
FROM bus_locations bl
INNER JOIN (
    SELECT bus_id, MAX(id) as max_id
    FROM bus_locations
    GROUP BY bus_id
) latest ON bl.bus_id = latest.bus_id AND bl.id = latest.max_id;

-- View: Active routes with stop count
CREATE OR REPLACE VIEW active_routes_summary AS
SELECT 
    r.*,
    COUNT(rs.id) as stop_count,
    MIN(rs.arrival_time) as first_pickup_time,
    MAX(rs.departure_time) as last_dropoff_time
FROM routes r
LEFT JOIN route_stops rs ON r.id = rs.route_id
WHERE r.status = 'active'
GROUP BY r.id;

-- View: Unresolved alerts
CREATE OR REPLACE VIEW unresolved_alerts AS
SELECT 
    la.*,
    TIMESTAMPDIFF(MINUTE, la.created_at, NOW()) as minutes_ago
FROM location_alerts la
WHERE la.is_resolved = FALSE
ORDER BY la.severity DESC, la.created_at DESC;

-- View: Pickup points summary
CREATE OR REPLACE VIEW pickup_points_summary AS
SELECT 
    district,
    COUNT(*) as point_count,
    SUM(student_count) as total_students,
    AVG(student_count) as avg_students_per_point
FROM pickup_dropoff_points
WHERE status = 'active' AND point_type IN ('pickup', 'both')
GROUP BY district
ORDER BY total_students DESC;