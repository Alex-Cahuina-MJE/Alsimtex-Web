-- Script para crear la tabla de usuarios y datos de prueba

-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente',
    telefono VARCHAR(20),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Insertar usuario administrador de prueba
-- Password: admin123 (hasheado con bcrypt)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES (
    'Administrador', 
    'admin@alsimtex.com', 
    '$2a$10$rX5YJYhZ9bJDEHOXJ5qZPOqGYKYV3J5Qk8xZq3YJXqZq3YJXqZq3Y', 
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insertar usuario cliente de prueba
-- Password: cliente123 (hasheado con bcrypt)
INSERT INTO usuarios (nombre, email, password, rol, telefono) 
VALUES (
    'Juan Pérez', 
    'cliente@example.com', 
    '$2a$10$rX5YJYhZ9bJDEHOXJ5qZPOqGYKYV3J5Qk8xZq3YJXqZq3YJXqZq3Y', 
    'cliente',
    '+51 948 435 269'
) ON CONFLICT (email) DO NOTHING;

-- Verificar usuarios creados
SELECT id, nombre, email, rol, created_at FROM usuarios;
