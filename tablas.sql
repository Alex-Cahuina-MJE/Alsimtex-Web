-- =================================================================
-- ESTRUCTURA DE TABLAS PARA ALSIMTEX
-- =================================================================

-- Crear la base de datos
CREATE DATABASE BDalsimtex;


CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Insertar usuario Admin
INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Admin', 'admin@alsimtex.com', 'admin123', 'admin');

-- =================================================================

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    imagenes TEXT[],
    imagen_principal VARCHAR(255),
    stock INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    descuento NUMERIC(5,2) DEFAULT 0.00,
    
    CONSTRAINT productos_descuento_check CHECK (descuento >= 0.00 AND descuento <= 100.00)
);

-- =================================================================
-- TABLA: pedidos
-- =================================================================

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(100) NOT NULL UNIQUE,
    usuario_id INTEGER,
    datos_cliente JSONB NOT NULL,
    direccion_envio JSONB,
    metodo_pago VARCHAR(50) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    descuento NUMERIC(10,2) DEFAULT 0,
    costo_envio NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    fecha_pedido TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    notas TEXT,
    tipo_entrega VARCHAR(20) DEFAULT 'envio',
    documento_pago VARCHAR(255),
    
    CONSTRAINT pedidos_tipo_entrega_check CHECK (tipo_entrega IN ('envio', 'recojo')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =================================================================
-- TABLA: pedido_items
-- =================================================================

CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER,
    producto_id INTEGER,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    tipo VARCHAR(100),
    tamano VARCHAR(50),
    notas TEXT,
    precio_total NUMERIC(10,2) NOT NULL,
    descuento_aplicado NUMERIC(5,2) DEFAULT 0,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =================================================================
-- ÍNDICES
-- =================================================================

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Índices para productos
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_productos_stock ON productos(stock);

-- Índices para pedidos
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);

-- Índices para pedido_items
CREATE INDEX idx_pedido_items_pedido ON pedido_items(pedido_id);
CREATE INDEX idx_pedido_items_producto ON pedido_items(producto_id);