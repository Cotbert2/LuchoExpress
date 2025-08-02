-- Script para crear la base de datos auth_db
-- Ejecutar como superusuario de PostgreSQL

-- Crear base de datos
CREATE DATABASE auth_db;

-- Conectar a la base de datos auth_db
\c auth_db;

-- La tabla users será creada automáticamente por Hibernate
-- pero aquí está la definición por referencia:

/*
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('ROOT', 'ADMIN', 'USER')),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_enabled ON users(enabled);

-- Insertar usuario ROOT inicial
INSERT INTO users (username, password_hash, email, role, enabled) 
VALUES ('root', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'root@luchoexpress.com', 'ROOT', true);
-- Password: password (solo para desarrollo)
*/
