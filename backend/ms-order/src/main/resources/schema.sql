-- Create database if not exists
CREATE DATABASE IF NOT EXISTS order_db;
USE order_db;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BINARY(16) PRIMARY KEY,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    customer_id BINARY(16) NOT NULL,
    delivery_address TEXT NOT NULL,
    status ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    order_date DATE NOT NULL,
    estimated_delivery_date DATE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_date (order_date),
    INDEX idx_status (status)
);

-- Order products table
CREATE TABLE IF NOT EXISTS order_products (
    id BINARY(16) PRIMARY KEY,
    order_id BINARY(16) NOT NULL,
    product_id BINARY(16) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);
