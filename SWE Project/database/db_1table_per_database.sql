-- ======================================
-- MICRO SERVICE DATABASE STRUCTURE
-- Mỗi bảng = 1 database riêng biệt
-- ======================================


CREATE DATABASE IF NOT EXISTS students_db;
USE students_db;

CREATE TABLE students (
  StudentID CHAR(36) PRIMARY KEY,
  ParentID CHAR(36),
  FullName VARCHAR(100),
  DateOfBirth DATE,
  PickupPoint VARCHAR(100),
  DropoffPoint VARCHAR(100)
);


CREATE DATABASE IF NOT EXISTS parents_db;
USE parents_db;

CREATE TABLE parents (
  ParentID CHAR(36) PRIMARY KEY,
  UserID CHAR(36),
  TrackingID CHAR(36),
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  Address VARCHAR(255)
);


CREATE DATABASE IF NOT EXISTS drivers_db;
USE drivers_db;

CREATE TABLE drivers (
  DriverID CHAR(36) PRIMARY KEY,
  UserID CHAR(36),
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100),
  Status ENUM('Active', 'Inactive') DEFAULT 'Active'
);


CREATE DATABASE IF NOT EXISTS routes_db;
USE routes_db;

CREATE TABLE routes (
  RouteID CHAR(36) PRIMARY KEY,
  StudentID CHAR(36),
  DriverID CHAR(36),
  BusID CHAR(36),
  RouteName VARCHAR(100),
  StartLocation VARCHAR(100),
  EndLocation VARCHAR(100)
);


CREATE DATABASE IF NOT EXISTS schedules_db;
USE schedules_db;

CREATE TABLE schedules (
  ScheduleID CHAR(36) PRIMARY KEY,
  RouteID CHAR(36),
  Date DATE,
  TimeStart TIME,
  TimeEnd TIME
);


CREATE DATABASE IF NOT EXISTS buses_db;
USE buses_db;

CREATE TABLE buses (
  BusID CHAR(36) PRIMARY KEY,
  PlateNumber VARCHAR(20),
  Capacity INT,
  PickupLocation VARCHAR(100),
  DropoffLocation VARCHAR(100)
);


CREATE DATABASE IF NOT EXISTS tracking_db;
USE tracking_db;

CREATE TABLE tracking (
  TrackingID CHAR(36) PRIMARY KEY,
  BusID CHAR(36),
  Latitude DECIMAL(10,6),
  Longitude DECIMAL(10,6),
  Timestamp DATETIME
);


CREATE DATABASE IF NOT EXISTS messages_db;
USE messages_db;

CREATE TABLE messages (
  MessageID CHAR(36) PRIMARY KEY,
  SenderID CHAR(36),
  ReceiverID CHAR(36),
  Content TEXT,
  Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  Type ENUM('Notice', 'Warning')
);


CREATE DATABASE IF NOT EXISTS users_db;
USE users_db;

CREATE TABLE users (
  UserID CHAR(36) PRIMARY KEY,
  RoleID CHAR(36),
  UserName VARCHAR(100) UNIQUE NOT NULL,
  Password VARCHAR(255) NOT NULL
);


CREATE DATABASE IF NOT EXISTS roles_db;
USE roles_db;

CREATE TABLE roles (
  RoleID CHAR(36) PRIMARY KEY,
  RoleName VARCHAR(50)
);


CREATE DATABASE IF NOT EXISTS admin_db;
USE admin_db;

CREATE TABLE admin (
  AdminID CHAR(36) PRIMARY KEY,
  UserID CHAR(36),
  FullName VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Email VARCHAR(100)
);
