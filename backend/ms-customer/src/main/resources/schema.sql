-- Script para crear la base de datos customers_db
-- Ejecutar como superusuario de PostgreSQL

-- Crear base de datos
CREATE DATABASE customers_db;

-- Crear usuario específico (opcional)
-- CREATE USER customers_user WITH PASSWORD 'customers_password';

-- Dar permisos al usuario (opcional)
-- GRANT ALL PRIVILEGES ON DATABASE customers_db TO customers_user;

-- Conectar a la base de datos customers_db
\c customers_db;

-- La tabla customers será creada automáticamente por Hibernate
-- pero aquí está la definición por referencia:

/*
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    enabled BOOLEAN NOT NULL DEFAULT true
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_document_id ON customers(document_id);
CREATE INDEX idx_customers_enabled ON customers(enabled);
*/
