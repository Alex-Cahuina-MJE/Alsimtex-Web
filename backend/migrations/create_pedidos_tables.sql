-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(100) UNIQUE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    datos_cliente JSONB NOT NULL, -- {nombre, email, telefono, documento}
    direccion_envio JSONB NOT NULL, -- {direccion, ciudad, provincia, codigoPostal, referencia}
    metodo_pago VARCHAR(50) NOT NULL, -- 'transferencia' o 'contraentrega'
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmado, enviado, entregado, cancelado
    fecha_pedido TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    notas TEXT
);

-- Crear tabla de items del pedido
CREATE TABLE IF NOT EXISTS pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    tipo VARCHAR(100),
    tamano VARCHAR(50),
    notas TEXT,
    precio_total DECIMAL(10,2) NOT NULL,
    descuento_aplicado DECIMAL(5,2) DEFAULT 0
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_producto ON pedido_items(producto_id);

-- Comentarios
COMMENT ON TABLE pedidos IS 'Tabla de pedidos realizados por clientes';
COMMENT ON TABLE pedido_items IS 'Tabla de items/productos incluidos en cada pedido';
COMMENT ON COLUMN pedidos.numero_pedido IS 'Número único de pedido generado automáticamente';
COMMENT ON COLUMN pedidos.datos_cliente IS 'Datos del cliente en formato JSON';
COMMENT ON COLUMN pedidos.direccion_envio IS 'Dirección de envío en formato JSON';
COMMENT ON COLUMN pedidos.estado IS 'Estado del pedido: pendiente, confirmado, enviado, entregado, cancelado';
