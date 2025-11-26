-- ================================
-- USER SERVICE DATABASE (CLEANED)
-- ================================

DROP DATABASE IF EXISTS user_service;
CREATE DATABASE user_service
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE user_service;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

-- ================================
-- ROLES TABLE
-- ================================
CREATE TABLE roles (
  RoleID VARCHAR(10) PRIMARY KEY,
  RoleName VARCHAR(50) NOT NULL UNIQUE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (RoleID, RoleName) VALUES
('R001', 'Admin'),
('R002', 'Driver'),
('R003', 'Parent');

-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE users (
  UserID VARCHAR(10) PRIMARY KEY,
  RoleID VARCHAR(10) NOT NULL,
  UserName VARCHAR(100) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (RoleID),
  CONSTRAINT fk_users_role FOREIGN KEY (RoleID)
      REFERENCES roles(RoleID)
      ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (UserID, RoleID, UserName, Password) VALUES
('U001', 'R001', 'admin1', 'admin123'),
('U002', 'R002', 'driver1', 'driver123'),
('U003', 'R002', 'driver2', 'driver456'),
('U004', 'R003', 'parent1', 'parent123'),
('U005', 'R003', 'parent2', 'parent456');

-- ================================
-- ADMIN TABLE
-- ================================
CREATE TABLE admin (
  AdminID VARCHAR(10) PRIMARY KEY,
  UserID VARCHAR(10) NOT NULL,
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_admin (UserID),
  CONSTRAINT fk_admin_user FOREIGN KEY (UserID)
      REFERENCES users(UserID)
      ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO admin (AdminID, UserID, FullName, PhoneNumber, Email) VALUES
('A001', 'U001', 'Nguyễn Văn A', '0909123456', 'admin1@example.com');

-- ================================
-- DRIVERS TABLE
-- ================================
CREATE TABLE drivers (
  DriverID VARCHAR(10) PRIMARY KEY,
  UserID VARCHAR(10) NOT NULL,
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  Status ENUM('Active','Inactive') DEFAULT 'Active',
  BusID VARCHAR(20),
  RouteID VARCHAR(20),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_driver (UserID),
  INDEX idx_bus (BusID),
  INDEX idx_route (RouteID),
  CONSTRAINT fk_driver_user FOREIGN KEY (UserID)
      REFERENCES users(UserID)
      ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO drivers (DriverID, UserID, FullName, PhoneNumber, Email, Status, BusID, RouteID) VALUES
('D001', 'U002', 'Trần Văn Tài Xế 1', '0909234567', 'driver1@example.com', 'Active', 'BUS-01', 'ROUTE-01'),
('D002', 'U003', 'Lê Văn Tài Xế 2', '0909345678', 'driver2@example.com', 'Inactive', 'BUS-02', 'ROUTE-02');

-- ================================
-- PARENTS TABLE
-- ================================
CREATE TABLE parents (
  ParentID VARCHAR(10) PRIMARY KEY,
  UserID VARCHAR(10) NOT NULL,
  TrackingID VARCHAR(100),
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  Address TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_parent (UserID),
  INDEX idx_tracking (TrackingID),
  INDEX idx_phone (PhoneNumber),
  INDEX idx_email (Email),
  CONSTRAINT fk_parent_user FOREIGN KEY (UserID)
      REFERENCES users(UserID)
      ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO parents (ParentID, UserID, TrackingID, FullName, PhoneNumber, Email, Address) VALUES
('P001', 'U004', 'TRK001', 'Phạm Thị Phụ Huynh 1', '0909456789', 'parent1@example.com', '123 Đường A, Quận B'),
('P002', 'U005', 'TRK002', 'Ngô Thị Phụ Huynh 2', '0909567890', 'parent2@example.com', '456 Đường C, Quận D');

COMMIT;