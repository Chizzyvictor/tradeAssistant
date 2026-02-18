-- Inventory Management System Database Schema
-- Created: 2026-02-18

CREATE DATABASE IF NOT EXISTS inventory_system;
USE inventory_system;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories table for product categorization
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category_id INT,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_sku (sku),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock movements table to track all stock changes
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    user_id INT NOT NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_date (movement_date),
    INDEX idx_type (movement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, full_name, email, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin@inventory.local', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Office Supplies', 'Office stationery and equipment'),
('Furniture', 'Office and home furniture'),
('Tools', 'Hardware and tools');

-- Insert sample products
INSERT INTO products (name, sku, description, category_id, unit_price, current_stock, min_stock_level) VALUES 
('Laptop Dell XPS 15', 'ELEC-001', 'High-performance laptop for professional use', 1, 1299.99, 25, 5),
('Wireless Mouse', 'ELEC-002', 'Ergonomic wireless mouse', 1, 29.99, 150, 20),
('Office Chair Premium', 'FURN-001', 'Comfortable ergonomic office chair', 3, 249.99, 45, 10),
('A4 Paper Pack', 'SUPP-001', 'Pack of 500 sheets A4 paper', 2, 5.99, 300, 50),
('USB Flash Drive 32GB', 'ELEC-003', '32GB USB 3.0 flash drive', 1, 12.99, 80, 15);
