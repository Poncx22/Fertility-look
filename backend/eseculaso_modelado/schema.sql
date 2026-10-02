-- Codigo SQL para la creacion de Tablas y BDD en postgree

CREATE DATABASE IF NOT EXISTS ciclo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ciclo_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NULL UNIQUE,
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cycle_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  last_period_date DATE NOT NULL,
  cycle_length INT NOT NULL CHECK (cycle_length BETWEEN 21 AND 45),
  period_length INT NOT NULL CHECK (period_length BETWEEN 2 AND 10),
  next_period_date DATE NOT NULL,
  ovulation_date DATE NOT NULL,
  fertile_start DATE NOT NULL,
  fertile_end DATE NOT NULL,
  user_id BIGINT NULL,
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_cycle_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_cycle_user (user_id),
  INDEX idx_cycle_last_period (last_period_date)
) ENGINE=InnoDB;
