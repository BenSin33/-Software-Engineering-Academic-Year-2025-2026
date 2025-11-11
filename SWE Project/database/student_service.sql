-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2025 at 04:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `students`
--

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `StudentID` bigint(20) NOT NULL,
  `ParentID` char(36) DEFAULT NULL,
  `FullName` varchar(100) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `PickUpPoint` varchar(100) DEFAULT NULL,
  `DropOffPoint` varchar(100) DEFAULT NULL,
  `routeID` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`StudentID`, `ParentID`, `FullName`, `DateOfBirth`, `PickUpPoint`, `DropOffPoint`, `routeID`) VALUES
(16, 'P001', 'Nguyễn Hoàng Long', '2007-09-28', '32/2B Tổ 40 KP3, Tân Thới Nhất, Quận 12, Thành phố Hồ Chí Minh, Việt Nam', '873 Cách Mạng Tháng Tám, P7, Tân Bình, HCM', 1),
(17, 'P002', 'Nguyễn Thị Thanh Thủy', '2007-10-12', '320a Đ. Nguyễn Văn Quá, Đông Hưng Thuận, Quận 12, Thành phố Hồ Chí Minh, Việt Nam', '873 Cách Mạng Tháng Tám, P7, Tân Bình, HCM', 1),
(18, 'P003', 'Phạm Hà Giang', '2007-10-17', '791 Đ. Trường Chinh, Tây Thạnh, Tân Bình, Thành phố Hồ Chí Minh 790000, Việt Nam', '873 Cách Mạng Tháng Tám, P7, Tân Bình, HCM', 1),
(19, 'P004', 'Vương Quý Khải', '2007-09-23', '18 Cộng Hòa, Phường 4, Tân Bình, Thành phố Hồ Chí Minh, Việt Nam', '873 Cách Mạng Tháng Tám, P7, Tân Bình, HCM', 1),
(20, 'P005', 'Thiên Đông Ly', '2007-10-19', '873 Cách Mạng Tháng Tám, Phường 7, Tân Bình, Thành phố Hồ Chí Minh, Việt Nam', '873 Cách Mạng Tháng Tám, P7, Tân Bình, HCM', 1),
(21, 'P007', 'Lê Minh Huy', '2007-09-05', '512 Đ. Lý Thường Kiệt, P8, Tân Bình, HCM', '873 Cách Mạng Tháng Tám, P7, Tân Bình, HCM', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`StudentID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `StudentID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
