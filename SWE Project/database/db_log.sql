CREATE TABLE logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  log_time DATETIME(3) NOT NULL, -- thời điểm log xảy ra
  level ENUM('ERROR','WARN','INFO','DEBUG','TRACE') NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  message VARCHAR(2000) NOT NULL, -- tiết kiệm hơn TEXT nếu log ngắn
  trace_id CHAR(36) NULL,
  tags JSON NULL,
  user_id INT NULL,
  ip_address VARCHAR(45) NULL,
  request_method VARCHAR(10) NULL,
  request_url VARCHAR(500) NULL,
  response_time INT NULL,
  stack_trace MEDIUMTEXT NULL, -- cho lỗi dài
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_log_time (log_time),
  INDEX idx_level (level),
  INDEX idx_service (service_name),
  INDEX idx_trace (trace_id),
  INDEX idx_user (user_id),
  FULLTEXT INDEX ft_message (message)
) ENGINE=InnoDB;
