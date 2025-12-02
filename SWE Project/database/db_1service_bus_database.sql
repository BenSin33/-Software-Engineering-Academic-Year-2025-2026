-- ===================================
-- BUS SERVICE DATABASE (Microservices Architecture)
-- ===================================
-- Service này quản lý: Buses, Maintenance, Events
-- ===================================

CREATE DATABASE IF NOT EXISTS bus_service_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE bus_service_db;

-- ===================================
-- TABLE: buses (Core entity của Bus Service)
-- ===================================
CREATE TABLE buses (
    id VARCHAR(20) PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    status ENUM('running', 'waiting', 'inactive', 'ready') DEFAULT 'ready',
    capacity INT NOT NULL,
    current_load INT DEFAULT 0,
    fuel_level INT DEFAULT 100,
    driver_name VARCHAR(100),
    route_id VARCHAR(20), -- Không có FK vì route ở Location Service
    speed INT DEFAULT 0,
    distance INT DEFAULT 0,
    location VARCHAR(255),
    last_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_route (route_id),
    INDEX idx_license (license_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: bus_maintenance_history
-- ===================================
CREATE TABLE bus_maintenance_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id VARCHAR(20) NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'inspection', 'emergency') NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    maintenance_date DATE NOT NULL,
    mechanic_name VARCHAR(100),
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id),
    INDEX idx_maintenance_date (maintenance_date),
    INDEX idx_next_maintenance (next_maintenance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: bus_events (Event Sourcing)
-- ===================================
CREATE TABLE bus_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id VARCHAR(20) NOT NULL,
    event_type ENUM('created', 'updated', 'status_changed', 'maintenance_scheduled', 'deleted') NOT NULL,
    event_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- TABLE: bus_location_tracking
-- Note: Lưu lịch sử location tại Bus Service để backup
-- Location Service sẽ có bảng real-time riêng
-- ===================================
CREATE TABLE bus_location_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(255),
    speed INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- INSERT SAMPLE DATA - Buses
-- ===================================
INSERT INTO buses (id, license_plate, model, year, status, capacity, current_load, fuel_level, driver_name, route_id, speed, distance, location, last_maintenance) VALUES
('BUS-01', '51A-12345', 'Hyundai Universe', 2020, 'running', 45, 38, 85, 'Lê Văn Cường', 'ROUTE-001', 42, 156200, 'Võ Văn Tần, Q.3', '2024-05-10'),
('BUS-02', '51A-98765', 'Hyundai County', 2021, 'inactive', 35, 0, 50, 'Trần Văn Hùng', 'ROUTE-005', 0, 98500, 'Xưởng bảo trì', '2024-06-01'),
('BUS-03', '51B-23456', 'Thaco Universe', 2021, 'running', 40, 32, 75, 'Nguyễn Thị Mai', 'ROUTE-002', 38, 142300, 'Lê Lợi, Q.1', '2024-04-15'),
('BUS-04', '51B-11223', 'Thaco Town', 2020, 'ready', 30, 0, 100, 'Võ Minh Tuấn', 'ROUTE-006', 0, 125600, 'Bãi đỗ trường', '2024-05-20'),
('BUS-05', '51C-34567', 'Hyundai County', 2019, 'running', 35, 28, 85, 'Lê Văn Cường', 'ROUTE-003', 42, 156200, 'Võ Văn Tần, Q.3', '2024-05-10'),
('BUS-07', '51D-45678', 'Mercedes-Benz Sprinter', 2022, 'waiting', 25, 0, 90, 'Phạm Thị Dung', 'ROUTE-004', 0, 67890, 'Bãi đỗ trường', '2024-05-25');

-- ===================================
-- INSERT SAMPLE DATA - Maintenance History
-- ===================================
INSERT INTO bus_maintenance_history (bus_id, maintenance_type, description, cost, maintenance_date, mechanic_name, next_maintenance_date) VALUES
('BUS-01', 'routine', 'Thay dầu động cơ, kiểm tra phanh', 1500000, '2024-05-10', 'Nguyễn Văn Sơn', '2024-08-10'),
('BUS-02', 'repair', 'Sửa hệ thống điện, thay ắc quy', 3500000, '2024-06-01', 'Trần Minh Tuấn', '2024-07-01'),
('BUS-03', 'inspection', 'Kiểm tra định kỳ 6 tháng', 500000, '2024-04-15', 'Lê Văn Hùng', '2024-10-15'),
('BUS-04', 'routine', 'Thay lốp xe, kiểm tra hệ thống treo', 2800000, '2024-05-20', 'Nguyễn Văn Sơn', '2024-08-20'),
('BUS-05', 'emergency', 'Sửa chữa khẩn cấp động cơ', 5000000, '2024-03-15', 'Trần Minh Tuấn', '2024-06-15');

-- ===================================
INSERT INTO bus_location_tracking (bus_id, latitude, longitude, location_name, speed, recorded_at) VALUES
('BUS-01', 10.7769, 106.7009, 'Võ Văn Tần, Q.3', 42, '2024-01-20 07:35:00'),
('BUS-01', 10.7789, 106.6987, 'Hai Bà Trưng, Q.3', 38, '2024-01-20 07:40:00'),
('BUS-03', 10.7754, 106.7007, 'Lê Lợi, Q.1', 38, '2024-01-20 07:38:00'),
('BUS-05', 10.7734, 106.6589, 'Cách Mạng Tháng 8, Q.10', 35, '2024-01-20 07:32:00');

-- ===================================
-- VIEWS - Để dễ query
-- ===================================

-- View: Buses cần bảo trì
CREATE OR REPLACE VIEW buses_need_maintenance AS
SELECT 
    b.*,
    DATEDIFF(CURRENT_DATE, b.last_maintenance) as days_since_maintenance,
    bmh.next_maintenance_date
FROM buses b
LEFT JOIN (
    SELECT bus_id, MAX(next_maintenance_date) as next_maintenance_date
    FROM bus_maintenance_history
    GROUP BY bus_id
) bmh ON b.id = bmh.bus_id
WHERE b.fuel_level < 30 
   OR b.distance > 150000 
   OR DATEDIFF(CURRENT_DATE, b.last_maintenance) > 90
   OR bmh.next_maintenance_date < CURRENT_DATE;

-- View: Bus statistics summary
CREATE OR REPLACE VIEW bus_statistics AS
SELECT 
    COUNT(*) as total_buses,
    SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
    SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
    SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
    SUM(capacity) as total_capacity,
    SUM(current_load) as total_load,
    AVG(fuel_level) as avg_fuel_level,
    SUM(CASE WHEN fuel_level < 30 THEN 1 ELSE 0 END) as low_fuel_count,
    SUM(CASE WHEN distance > 150000 THEN 1 ELSE 0 END) as high_mileage_count
FROM buses;