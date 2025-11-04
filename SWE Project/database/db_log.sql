CREATE DATABASE IF NOT EXISTS Logs_db;
USE Logs_db;
CREATE TABLE logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(20) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    trace_id VARCHAR(100) NULL,
    tags JSON NULL,
    INDEX idx_level (level),
    INDEX idx_service (service_name),
    INDEX idx_trace (trace_id),
    INDEX idx_ts (ts),
    FULLTEXT INDEX idx_message (message)
);
