-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 23, 2025 lúc 06:55 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `route_service`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `routes`
--
CREATE DATABASE IF NOT EXISTS routes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE routes;

CREATE TABLE `routes` (
  `RouteID` int(11) NOT NULL,
  `DriverID` VARCHAR(20) DEFAULT NULL,
  `BusID` VARCHAR(20) DEFAULT NULL,
  `RouteName` varchar(100) DEFAULT NULL,
  `StartLocation` varchar(100) DEFAULT NULL,
  `EndLocation` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `routes`
--
CREATE DATABASE IF NOT EXISTS routes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE routes;

INSERT INTO `routes` (`RouteID`, `DriverID`, `BusID`, `RouteName`, `StartLocation`, `EndLocation`) VALUES
(1, 'DRI001', '01', 'Tuyến 01', 'Bến Thành', 'Suối Tiên'),
(2, 'DRI002', '02', 'Tuyến 02', 'Chợ Lớn', 'Suối Tiên'),
(3, 'DRI003', '03', 'Tuyến 03', 'Ngã tư Hàng Xanh', 'Đại học Sài Gòn');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `schedules`
--

CREATE TABLE `schedules` (
  `ScheduleID` int(11) NOT NULL,
  `RouteID` int(11) DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `TimeStart` time DEFAULT NULL,
  `TimeEnd` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `schedules`
--

INSERT INTO `schedules` (`ScheduleID`, `RouteID`, `Date`, `TimeStart`, `TimeEnd`) VALUES
(1, 1, '2025-10-23', '06:00:00', '07:30:00'),
(3, 2, '2025-10-23', '07:00:00', '08:15:00'),
(4, 3, '2025-10-24', '09:00:00', '10:30:00');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`RouteID`);

--
-- Chỉ mục cho bảng `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`ScheduleID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `routes`
--
ALTER TABLE `routes`
  MODIFY `RouteID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
