-- ======================================
-- MICRO SERVICE DATABASE STRUCTURE
-- Mỗi service = 1 database riêng biệt
-- ======================================

CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

CREATE TABLE roles (
  RoleID CHAR(36) PRIMARY KEY,
  RoleName VARCHAR(50) NOT NULL
);

CREATE TABLE users (
  UserID CHAR(36) PRIMARY KEY,
  RoleID CHAR(36),
  UserName VARCHAR(100) UNIQUE NOT NULL,
  Password VARCHAR(255) NOT NULL,
  FOREIGN KEY (RoleID) REFERENCES roles(RoleID)
);

CREATE TABLE admin (
  AdminID CHAR(36) PRIMARY KEY,
  UserID CHAR(36),
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);

CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

CREATE TABLE students (
  StudentID CHAR(36) PRIMARY KEY,
  ParentID CHAR(36), -- reference only, no FK
  FullName VARCHAR(100),
  DateOfBirth DATE,
  PickupPoint VARCHAR(100),
  DropoffPoint VARCHAR(100)
);

CREATE DATABASE IF NOT EXISTS parent_db;
USE parent_db;

CREATE TABLE parents (
  ParentID CHAR(36) PRIMARY KEY,
  UserID CHAR(36),  -- reference to auth_db.users
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  Address VARCHAR(255)
);

CREATE DATABASE IF NOT EXISTS transport_db;
USE transport_db;

CREATE TABLE drivers (
  DriverID CHAR(36) PRIMARY KEY,
  UserID CHAR(36), -- reference to auth_db.users
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  Status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

CREATE TABLE buses (
  BusID CHAR(36) PRIMARY KEY,
  PlateNumber VARCHAR(20),
  Capacity INT,
  PickupLocation VARCHAR(100),
  DropoffLocation VARCHAR(100)
);

CREATE TABLE routes (
  RouteID CHAR(36) PRIMARY KEY,
  StudentID CHAR(36),  -- reference only
  DriverID CHAR(36),
  BusID CHAR(36),
  RouteName VARCHAR(100),
  StartLocation VARCHAR(100),
  EndLocation VARCHAR(100)
);

CREATE TABLE schedules (
  ScheduleID CHAR(36) PRIMARY KEY,
  RouteID CHAR(36),
  Date DATE,
  TimeStart TIME,
  TimeEnd TIME
);

CREATE DATABASE IF NOT EXISTS tracking_db;
USE tracking_db;

CREATE TABLE tracking (
  TrackingID CHAR(36) PRIMARY KEY,
  BusID CHAR(36), -- reference only
  Latitude DECIMAL(10, 6),
  Longitude DECIMAL(10, 6),
  Timestamp DATETIME
);

CREATE DATABASE IF NOT EXISTS message_db;
USE message_db;

CREATE TABLE messages (
  MessageID CHAR(36) PRIMARY KEY,
  SenderID CHAR(36),
  ReceiverID CHAR(36),
  Content TEXT,
  Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  Type ENUM('Notice', 'Warning')
);
