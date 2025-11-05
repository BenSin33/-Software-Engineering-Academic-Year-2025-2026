-- ======================================
-- PARENT SERVICE DATABASE
-- ======================================

-- 1. Tạo database
CREATE DATABASE IF NOT EXISTS parent_service_db
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE parent_service_db;

-- 2. Xóa bảng cũ nếu có
DROP TABLE IF EXISTS parents;

-- 3. Tạo bảng parents
CREATE TABLE parents (
  ParentID CHAR(36) PRIMARY KEY,
  UserID CHAR(36) NOT NULL,
  TrackingID CHAR(36),
  FullName VARCHAR(100) NOT NULL,
  PhoneNumber VARCHAR(20) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  Address VARCHAR(255),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_id (UserID),
  INDEX idx_tracking_id (TrackingID),
  INDEX idx_phone (PhoneNumber),
  INDEX idx_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Thêm dữ liệu mẫu
INSERT INTO parents (ParentID, UserID, TrackingID, FullName, PhoneNumber, Email, Address) VALUES
('P001', 'U004', 'T001', 'Nguyễn Thị Lan', '0901234567', 'ntl@gmail.com', '123 Nguyễn Văn Cừ, Q.5, TP.HCM'),
('P002', 'U005', 'T002', 'Trần Văn Bình', '0912345678', 'tvb@gmail.com', '456 Lê Văn Sỹ, Q.3, TP.HCM'),
('P003', 'U006', 'T003', 'Lê Thị Mai', '0923456789', 'ltm@gmail.com', '789 Võ Văn Tần, Q.3, TP.HCM'),
('P004', 'U007', 'T004', 'Phạm Văn Nam', '0934567890', 'pvn@gmail.com', '321 Hai Bà Trưng, Q.1, TP.HCM'),
('P005', 'U008', 'T005', 'Hoàng Thị Hương', '0945678901', 'hth@gmail.com', '654 Nguyễn Thị Minh Khai, Q.1, TP.HCM');

