const pool = require('./src/db/database');

async function setupDatabase() {
    try {
        console.log('🔧 Configurando base de datos...\n');
        
        // Tabla de productos
        console.log('📦 Creando tabla de productos...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                id_producto VARCHAR(50) UNIQUE NOT NULL,
                nombre_producto VARCHAR(200) NOT NULL,
                descripcion_corta TEXT,
                categoria VARCHAR(100) DEFAULT 'Productos Terminados',
                subcategoria VARCHAR(100),
                marca VARCHAR(100),
                modelo VARCHAR(100),
                sku VARCHAR(100),
                codigo_barras VARCHAR(100),
                unidad_medida VARCHAR(50) DEFAULT 'UNIDAD',
                estado VARCHAR(20) DEFAULT 'Activo',
                precio DECIMAL(10, 2) DEFAULT 0.00,
                stock INTEGER DEFAULT 0,
                imagen_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla productos creada\n');

        // Tabla de pedidos
        console.log('📋 Creando tabla de pedidos...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id),
                cliente_nombre VARCHAR(200),
                cliente_email VARCHAR(200),
                total DECIMAL(10, 2) NOT NULL,
                estado VARCHAR(50) DEFAULT 'Pendiente',
                metodo_pago VARCHAR(100),
                direccion_envio TEXT,
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla pedidos creada\n');

        // Tabla de detalles de pedidos
        console.log('📋 Creando tabla de detalles de pedidos...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pedidos_detalle (
                id SERIAL PRIMARY KEY,
                pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
                producto_id INTEGER REFERENCES productos(id),
                producto_nombre VARCHAR(200),
                cantidad INTEGER NOT NULL,
                precio_unitario DECIMAL(10, 2) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla pedidos_detalle creada\n');

        // Insertar productos de ejemplo
        console.log('📦 Insertando productos de ejemplo...');
        const productosEjemplo = [
            ['010001', 'SABANA BP 1P', 'Sabana de alta calidad 1 plaza', 'Productos Terminados', 'SABANAS', 'BP', '1 PLAZA', '', '010001', 'UNIDAD', 'Activo', 45.00, 50],
            ['010002', 'SABANA BP 1.5P', 'Sabana de alta calidad 1.5 plazas', 'Productos Terminados', 'SABANAS', 'BP', '1 1/2 PLAZA', '', '010002', 'UNIDAD', 'Activo', 55.00, 45],
            ['010003', 'SABANA BP 2P', 'Sabana de alta calidad 2 plazas', 'Productos Terminados', 'SABANAS', 'BP', '2 PLAZAS', '', '010003', 'UNIDAD', 'Activo', 65.00, 40],
            ['020001', 'EDREDON PREMIUM 1.5P', 'Edredón premium confortable', 'Productos Terminados', 'EDREDONES', 'PREMIUM', '1 1/2 PLAZA', '', '020001', 'UNIDAD', 'Activo', 120.00, 30],
            ['020002', 'EDREDON PREMIUM 2P', 'Edredón premium confortable', 'Productos Terminados', 'EDREDONES', 'PREMIUM', '2 PLAZAS', '', '020002', 'UNIDAD', 'Activo', 150.00, 25],
            ['030001', 'ALMOHADA DELUXE', 'Almohada ergonómica', 'Productos Terminados', 'ALMOHADAS', 'DELUXE', 'ESTANDAR', '', '030001', 'UNIDAD', 'Activo', 35.00, 60]
        ];

        for (const producto of productosEjemplo) {
            try {
                await pool.query(`
                    INSERT INTO productos 
                    (id_producto, nombre_producto, descripcion_corta, categoria, subcategoria, marca, modelo, sku, codigo_barras, unidad_medida, estado, precio, stock)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                `, producto);
            } catch (error) {
                if (error.code !== '23505') { // Ignorar duplicados
                    throw error;
                }
            }
        }
        console.log('✅ Productos de ejemplo insertados\n');

        // Insertar pedidos de ejemplo
        console.log('📋 Insertando pedidos de ejemplo...');
        const pedidosEjemplo = [
            [1, 'Juan Pérez', 'cliente@example.com', 250.00, 'Completado', 'Tarjeta', 'Av. Principal 123, Arequipa'],
            [1, 'María García', 'maria@example.com', 380.00, 'Pendiente', 'Efectivo', 'Calle Los Pinos 456, Arequipa'],
            [1, 'Carlos López', 'carlos@example.com', 150.00, 'En proceso', 'Transferencia', 'Jr. Las Flores 789, Arequipa']
        ];

        for (const pedido of pedidosEjemplo) {
            try {
                await pool.query(`
                    INSERT INTO pedidos 
                    (usuario_id, cliente_nombre, cliente_email, total, estado, metodo_pago, direccion_envio)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, pedido);
            } catch (error) {
                // Continuar si hay error
            }
        }
        console.log('✅ Pedidos de ejemplo insertados\n');

        // Mostrar resumen
        const countProductos = await pool.query('SELECT COUNT(*) FROM productos');
        const countUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        const countPedidos = await pool.query('SELECT COUNT(*) FROM pedidos');

        console.log('📊 Resumen de la base de datos:');
        console.log(`   👥 Usuarios: ${countUsuarios.rows[0].count}`);
        console.log(`   📦 Productos: ${countProductos.rows[0].count}`);
        console.log(`   📋 Pedidos: ${countPedidos.rows[0].count}`);
        
        console.log('\n✅ Base de datos configurada exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error configurando base de datos:', error);
        process.exit(1);
    }
}

setupDatabase();
