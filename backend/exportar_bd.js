const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const exportarBaseDatos = async () => {
    try {
        console.log('📊 EXPORTANDO ESTRUCTURA Y DATOS DE LA BASE DE DATOS\n');
        console.log('=' * 60);

        // 1. ESTRUCTURA DE TABLAS
        console.log('\n🗄️  ESTRUCTURA DE TABLAS:\n');
        
        const tablas = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        for (const tabla of tablas.rows) {
            const tableName = tabla.table_name;
            console.log(`\n📋 TABLA: ${tableName.toUpperCase()}`);
            console.log('-'.repeat(40));

            // Obtener columnas
            const columnas = await pool.query(`
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = $1 
                ORDER BY ordinal_position
            `, [tableName]);

            columnas.rows.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
                const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
                console.log(`  • ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
            });

            // Contar registros
            const count = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
            console.log(`  📊 Registros: ${count.rows[0].count}`);
        }

        // 2. DATOS DE LAS TABLAS PRINCIPALES
        console.log('\n\n📦 DATOS DE PRODUCTOS:\n');
        console.log('=' * 60);

        const productos = await pool.query(`
            SELECT 
                id,
                nombre,
                categoria,
                subcategoria,
                precio_base,
                stock,
                descuento,
                imagen_principal,
                array_length(imagenes, 1) as num_imagenes,
                imagenes
            FROM productos 
            ORDER BY id DESC
            LIMIT 10
        `);

        productos.rows.forEach(producto => {
            console.log(`\n🛍️  ID ${producto.id}: ${producto.nombre}`);
            console.log(`   Categoría: ${producto.categoria} > ${producto.subcategoria || 'N/A'}`);
            console.log(`   Precio: S/${producto.precio_base} | Stock: ${producto.stock} | Descuento: ${producto.descuento}%`);
            console.log(`   Imagen principal: ${producto.imagen_principal ? 'SÍ' : 'NO'}`);
            console.log(`   Imágenes adicionales: ${producto.num_imagenes || 0}`);
            if (producto.imagenes && producto.imagenes.length > 0) {
                producto.imagenes.forEach((img, index) => {
                    console.log(`     ${index + 1}. ${img.substring(0, 60)}...`);
                });
            }
        });

        // 3. DATOS DE USUARIOS
        console.log('\n\n👥 DATOS DE USUARIOS:\n');
        console.log('=' * 60);

        const usuarios = await pool.query(`
            SELECT 
                id,
                nombre,
                email,
                rol,
                created_at
            FROM usuarios 
            ORDER BY id
        `);

        usuarios.rows.forEach(usuario => {
            console.log(`👤 ID ${usuario.id}: ${usuario.nombre} (${usuario.email})`);
            console.log(`   Rol: ${usuario.rol} | Creado: ${usuario.created_at?.toISOString()?.split('T')[0]}`);
        });

        // 4. DATOS DE PEDIDOS
        console.log('\n\n📦 DATOS DE PEDIDOS:\n');
        console.log('=' * 60);

        const pedidos = await pool.query(`
            SELECT 
                p.id,
                p.cliente_nombre,
                p.total,
                p.estado,
                p.metodo_pago,
                p.created_at,
                COUNT(pd.id) as items
            FROM pedidos p
            LEFT JOIN pedidos_detalle pd ON p.id = pd.pedido_id
            GROUP BY p.id, p.cliente_nombre, p.total, p.estado, p.metodo_pago, p.created_at
            ORDER BY p.id DESC
            LIMIT 5
        `);

        pedidos.rows.forEach(pedido => {
            console.log(`📋 Pedido #${pedido.id}: ${pedido.cliente_nombre}`);
            console.log(`   Total: S/${pedido.total} | Estado: ${pedido.estado} | Pago: ${pedido.metodo_pago}`);
            console.log(`   Items: ${pedido.items} | Fecha: ${pedido.created_at?.toISOString()?.split('T')[0]}`);
        });

        // 5. CÓDIGO SQL PARA RECREAR LA BASE DE DATOS
        console.log('\n\n💾 CÓDIGO SQL PARA RECREAR LA BASE DE DATOS:\n');
        console.log('=' * 60);

        console.log(`
-- ========================================
-- SCRIPT COMPLETO PARA RECREAR BDALSIMTEX
-- ========================================

-- 1. CREAR BASE DE DATOS
CREATE DATABASE "BDalsimtex"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar a la base de datos BDalsimtex
\\c BDalsimtex;

-- 2. CREAR TABLA USUARIOS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREAR TABLA PRODUCTOS  
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(50),
    imagenes TEXT[],
    imagen_principal TEXT,
    stock INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT true,
    descuento NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREAR TABLA PEDIDOS
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    cliente_nombre VARCHAR(200),
    cliente_email VARCHAR(200),
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    metodo_pago VARCHAR(100),
    direccion_envio TEXT,
    notas TEXT,
    tipo_entrega VARCHAR(50) DEFAULT 'delivery',
    documento_pago VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREAR TABLA PEDIDOS_DETALLE
CREATE TABLE pedidos_detalle (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    producto_nombre VARCHAR(200),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. INSERTAR USUARIO ADMINISTRADOR
INSERT INTO usuarios (username, email, password, role) VALUES 
('admin', 'admin@alsimtex.com', '$2b$10$8oHEcg4pV6QXqV4t4ew0h.5bF7Qy8Hg7lG8Qy8Hg7lG8Qy8Hg7lG8', 'admin');

-- 7. INSERTAR PRODUCTOS DE EJEMPLO
INSERT INTO productos (nombre, descripcion, precio_base, categoria, subcategoria, imagen_principal, imagenes, stock, descuento) VALUES
('Frazada Premium Doble Vista', 'Frazada reversible de alta calidad con diseños únicos. Perfecta para todas las estaciones.', 85.00, 'FRAZADAS', '2 PLAZAS', 'https://m.media-amazon.com/images/I/81J+QP3HWIL._AC_SL1500_.jpg', '{"https://m.media-amazon.com/images/I/81J+QP3HWIL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/819y6l5WVUL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/81RJ9mKLMQL._AC_SL1500_.jpg"}', 15, 10),
('Edredón King Size Luxury', 'Edredón de lujo con relleno de fibra sintética de alta densidad. Incluye fundas de almohada.', 180.00, 'EDREDONES', 'KING SIZE', 'https://m.media-amazon.com/images/I/81ykw6GMSYL._AC_SL1500_.jpg', '{"https://m.media-amazon.com/images/I/81ykw6GMSYL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/91cUGfGq1pL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/81vNKPQqz7L._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/81-5JKnLb8L._AC_SL1500_.jpg"}', 8, 15),
('Juego de Sábanas Microfibra', 'Set completo de sábanas en microfibra ultra suave. Incluye sábana, funda de almohada y elástico.', 120.00, 'SABANAS', '2 PLAZAS', 'https://m.media-amazon.com/images/I/91H0B9zVPkL._AC_SL1500_.jpg', '{"https://m.media-amazon.com/images/I/91H0B9zVPkL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/81z8kGgx1vL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/81BQqY7DVOL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/81VpUYR0SyL._AC_SL1500_.jpg","https://m.media-amazon.com/images/I/91WbFOaZc3L._AC_SL1500_.jpg"}', 20, 5);

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
        `);

        console.log('\n✅ Exportación completada!');
        console.log('\n📋 RESUMEN:');
        console.log(`   • Tablas creadas: ${tablas.rows.length}`);
        console.log(`   • Productos: ${productos.rows.length} (mostrando últimos 10)`);
        console.log(`   • Usuarios: ${usuarios.rows.length}`);
        console.log(`   • Pedidos: ${pedidos.rows.length} (mostrando últimos 5)`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
};

exportarBaseDatos();