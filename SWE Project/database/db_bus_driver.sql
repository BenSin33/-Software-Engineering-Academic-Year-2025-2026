-- bus_service/db/schema.sql
-- Tạo database
CREATE DATABASE IF NOT EXISTS bus_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bus_service_db;

-- ============================================
-- Bảng: Buses (Thông tin xe buýt)
-- ============================================
CREATE TABLE IF NOT EXISTS Buses (
    BusID VARCHAR(20) PRIMARY KEY COMMENT 'Mã xe (VD: BUS-01)',
    PlateNumber VARCHAR(20) NOT NULL UNIQUE COMMENT 'Biển số xe',
    Capacity INT NOT NULL DEFAULT 30 COMMENT 'Sức chứa (số người)',
    CurrentLoad INT DEFAULT 0 COMMENT 'Số hành khách hiện tại',
    FuelLevel INT DEFAULT 100 COMMENT 'Mức nhiên liệu (%)',
    Status ENUM('running', 'waiting', 'inactive', 'ready') DEFAULT 'ready' COMMENT 'Trạng thái xe',
    Location VARCHAR(255) DEFAULT NULL COMMENT 'Vị trí hiện tại',
    PickUpLocation VARCHAR(255) DEFAULT NULL COMMENT 'Điểm đón',
    DropOffLocation VARCHAR(255) DEFAULT NULL COMMENT 'Điểm trả',
    DriverID VARCHAR(10) DEFAULT NULL COMMENT 'ID tài xế đang điều khiển',
    RouteID VARCHAR(20) DEFAULT NULL COMMENT 'ID tuyến đường đang chạy',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (Status),
    INDEX idx_driver (DriverID),
    INDEX idx_route (RouteID)
) ENGINE=InnoDB COMMENT='Quản lý thông tin xe buýt';

-- ============================================
-- Bảng: Drivers (Thông tin tài xế)
-- ============================================
CREATE TABLE IF NOT EXISTS Drivers (
    DriverID VARCHAR(10) PRIMARY KEY COMMENT 'ID tài xế',
    UserID VARCHAR(10) NOT NULL UNIQUE COMMENT 'ID người dùng từ user_service',
    Fullname VARCHAR(100) NOT NULL COMMENT 'Họ tên tài xế',
    PhoneNumber VARCHAR(15) NOT NULL COMMENT 'Số điện thoại',
    Email VARCHAR(100) NOT NULL COMMENT 'Email',
    Status ENUM('active', 'rest') DEFAULT 'active' COMMENT 'Trạng thái (hoạt động/nghỉ)',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (UserID),
    INDEX idx_status (Status)
) ENGINE=InnoDB COMMENT='Quản lý thông tin tài xế';

-- ============================================
-- Dữ liệu mẫu: Buses
-- ============================================
INSERT INTO Buses (BusID, PlateNumber, Capacity, CurrentLoad, FuelLevel, Status, Location, PickUpLocation, DropOffLocation, DriverID, RouteID) VALUES
('BUS-01', '51A-12345', 45, 32, 85, 'running', 'Quận 1, TP.HCM', '227 Nguyễn Văn Cừ, Q5', 'Trường THPT Năng Khiếu', 'D001', 'ROUTE-01'),
('BUS-02', '51B-23456', 40, 0, 100, 'ready', 'Bãi đỗ trường', NULL, NULL, NULL, NULL),
('BUS-03', '51C-34567', 50, 38, 60, 'running', 'Quận 3, TP.HCM', 'Bến xe Miền Đông', 'Trường THPT Lê Hồng Phong', 'D002', 'ROUTE-02'),
('BUS-04', '51D-45678', 35, 0, 95, 'waiting', 'Điểm đón học sinh', '123 Lê Lợi, Q1', 'Trường THPT Trần Phú', 'D003', 'ROUTE-03'),
('BUS-05', '51E-56789', 48, 0, 30, 'inactive', 'Garage', NULL, NULL, NULL, NULL),
('BUS-06', '51F-67890', 42, 25, 78, 'running', 'Quận 7, TP.HCM', '456 Nguyễn Thị Minh Khai, Q3', 'Trường THPT Gia Định', 'D004', 'ROUTE-04'),
('BUS-07', '51G-78901', 38, 0, 100, 'ready', 'Bãi đỗ trường', NULL, NULL, NULL, NULL),
('BUS-08', '51H-89012', 45, 40, 88, 'running', 'Quận 10, TP.HCM', '789 Võ Văn Tần, Q3', 'Trường THPT Mạc Đĩnh Chi', 'D005', 'ROUTE-05');

-- ============================================
-- Dữ liệu mẫu: Drivers
-- ============================================
INSERT INTO Drivers (DriverID, UserID, Fullname, PhoneNumber, Email, Status) VALUES
('D001', 'U002', 'Trần Văn Tài Xế 1', '0909234567', 'driver1@example.com', 'active'),
('D002', 'U003', 'Lê Văn Tài Xế 2', '0909345678', 'driver2@example.com', 'active'),
('D003', 'U103', 'Lê Văn Cường', '0923456789', 'lvc@school.edu.vn', 'rest'),
('D004', 'U104', 'Phạm Thị Dung', '0934567890', 'ptd@school.edu.vn', 'active'),
('D005', 'U105', 'Hoàng Văn Em', '0945678901', 'hve@school.edu.vn', 'rest'),
('D006', 'U106', 'Đỗ Thị Phương', '0956789012', 'dtp@school.edu.vn', 'active'),
('D007', 'U107', 'Vũ Văn Giang', '0967890123', 'vvg@school.edu.vn', 'active'),
('D008', 'U108', 'Bùi Thị Hoa', '0978901234', 'bth@school.edu.vn', 'active'),
('D009', 'U109', 'Đặng Văn Inh', '0989012345', 'dvi@school.edu.vn', 'rest'),
('D010', 'U110', 'Ngô Thị Kiều', '0990123456', 'ntk@school.edu.vn', 'active'),
('D011', 'U111', 'Lương Văn Long', '0901234568', 'lvl@school.edu.vn', 'active'),
('D012', 'U112', 'Cao Thị Mai', '0912345679', 'ctm@school.edu.vn', 'rest');