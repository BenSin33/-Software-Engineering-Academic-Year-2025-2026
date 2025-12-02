-- -- phpMyAdmin SQL Dump
-- -- version 5.2.1
-- -- https://www.phpmyadmin.net/
-- --
-- -- Máy chủ: 127.0.0.1
-- -- Thời gian đã tạo: Th10 23, 2025 lúc 06:55 PM
-- -- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- -- Phiên bản PHP: 8.0.30

-- SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
-- START TRANSACTION;
-- SET time_zone = "+00:00";


-- /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
-- /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
-- /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
-- /*!40101 SET NAMES utf8mb4 */;

-- --
-- -- Cơ sở dữ liệu: `route_service`
-- --

-- -- --------------------------------------------------------

-- --
-- -- Cấu trúc bảng cho bảng `routes`
-- --
-- CREATE DATABASE IF NOT EXISTS routes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE routes;

-- CREATE TABLE `routes` (
--   `RouteID` int(11) NOT NULL,
--   `DriverID` VARCHAR(20) DEFAULT NULL,
--   `BusID` VARCHAR(20) DEFAULT NULL,
--   `RouteName` varchar(100) DEFAULT NULL,
--   `StartLocation` varchar(100) DEFAULT NULL,
--   `EndLocation` varchar(100) DEFAULT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --
-- -- Đang đổ dữ liệu cho bảng `routes`
-- --
-- CREATE DATABASE IF NOT EXISTS routes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE routes;

-- INSERT INTO `routes` (`RouteID`, `DriverID`, `BusID`, `RouteName`, `StartLocation`, `EndLocation`) VALUES
-- (1, 'DRI001', '01', 'Tuyến 01', 'Bến Thành', 'Suối Tiên'),
-- (2, 'DRI002', '02', 'Tuyến 02', 'Chợ Lớn', 'Suối Tiên'),
-- (3, 'DRI003', '03', 'Tuyến 03', 'Ngã tư Hàng Xanh', 'Đại học Sài Gòn');

-- -- --------------------------------------------------------

-- --
-- -- Cấu trúc bảng cho bảng `schedules`
-- --

-- CREATE TABLE `schedules` (
--   `ScheduleID` int(11) NOT NULL,
--   `RouteID` int(11) DEFAULT NULL,
--   `Date` date DEFAULT NULL,
--   `TimeStart` time DEFAULT NULL,
--   `TimeEnd` time DEFAULT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --
-- -- Đang đổ dữ liệu cho bảng `schedules`
-- --

-- INSERT INTO `schedules` (`ScheduleID`, `RouteID`, `Date`, `TimeStart`, `TimeEnd`) VALUES
-- (1, 1, '2025-10-23', '06:00:00', '07:30:00'),
-- (3, 2, '2025-10-23', '07:00:00', '08:15:00'),
-- (4, 3, '2025-10-24', '09:00:00', '10:30:00');

-- --
-- -- Chỉ mục cho các bảng đã đổ
-- --

-- --
-- -- Chỉ mục cho bảng `routes`
-- --
-- ALTER TABLE `routes`
--   ADD PRIMARY KEY (`RouteID`);

-- --
-- -- Chỉ mục cho bảng `schedules`
-- --
-- ALTER TABLE `schedules`
--   ADD PRIMARY KEY (`ScheduleID`);

-- --
-- -- AUTO_INCREMENT cho các bảng đã đổ
-- --

-- --
-- -- AUTO_INCREMENT cho bảng `routes`
-- --
-- ALTER TABLE `routes`
--   MODIFY `RouteID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
-- COMMIT;

-- /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
-- /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
-- /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


-- 1. TẠO LẠI DATABASE (Để đảm bảo sạch sẽ)
DROP DATABASE IF EXISTS routes; -- Xóa cái cũ đi
CREATE DATABASE routes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE routes;

-- 2. TẠO BẢNG ROUTES
CREATE TABLE routes (
  RouteID INT AUTO_INCREMENT PRIMARY KEY, -- ID tự tăng (1, 2, 3...)
  RouteName VARCHAR(100) NOT NULL,
  StartLocation VARCHAR(255),
  EndLocation VARCHAR(255),
  
  -- Các cột liên kết (Foreign Keys lỏng)
  DriverID VARCHAR(20), -- Phải khớp với D001, D002...
  BusID VARCHAR(20),    -- Phải khớp với BUS-01, BUS-02...
  
  Distance DECIMAL(10, 2) DEFAULT 0, -- Khoảng cách (km)
  Description TEXT,
  Status ENUM('Active', 'Inactive') DEFAULT 'Active',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. THÊM DỮ LIỆU MẪU (CHUẨN HÓA)
-- Lưu ý: DriverID và BusID ở đây phải trùng với dữ liệu bên User/Bus Service
INSERT INTO routes (RouteName, StartLocation, EndLocation, DriverID, BusID, Distance, Description) VALUES 
('Tuyến 01: Bến Thành - Suối Tiên', 'Bến Thành (Q1)', 'KDL Suối Tiên (TP.Thủ Đức)', 'D001', 'BUS-01', 19.5, 'Tuyến trục chính đi qua Xa lộ Hà Nội'),
('Tuyến 02: Chợ Lớn - Bến Thành', 'Ga Chợ Lớn (Q5)', 'Bến Thành (Q1)', 'D002', 'BUS-02', 8.2, 'Đi qua các bệnh viện lớn'),
('Tuyến 03: An Sương - Đại học Quốc Gia', 'BX An Sương', 'ĐHQG TP.HCM', 'D003', 'BUS-03', 25.0, 'Phục vụ sinh viên làng đại học'),
('Tuyến 04: BX Miền Đông - BX Miền Tây', 'BX Miền Đông cũ', 'BX Miền Tây', 'D004', 'BUS-04', 15.3, 'Kết nối 2 bến xe lớn'),
('Tuyến 05: Gò Vấp - Quận 7', 'Ngã 5 Chuồng Chó', 'Lotte Mart Q7', 'D001', 'BUS-05', 12.8, 'Đi xuyên tâm thành phố'),
('Tuyến 06: Sân bay Tân Sơn Nhất - Trung tâm', 'Ga Quốc tế TSN', 'Công viên 23/9', NULL, NULL, 7.5, 'Tuyến chưa phân công tài xế/xe');

-- 4. KIỂM TRA LẠI
SELECT * FROM routes;