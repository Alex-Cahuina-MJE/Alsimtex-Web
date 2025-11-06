const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const agregarProductosConCarrusel = async () => {
    try {
        await pool.query('BEGIN');

        console.log('🔄 Agregando productos con múltiples imágenes para probar carrusel...\n');

        // Producto 1: Frazada con 3 imágenes
        const producto1 = {
            nombre: 'Frazada Premium Doble Vista',
            descripcion: 'Frazada reversible de alta calidad con diseños únicos. Perfecta para todas las estaciones.',
            precio_base: 85.00,
            categoria: 'FRAZADAS',
            subcategoria: '2 PLAZAS',
            imagen_principal: 'https://m.media-amazon.com/images/I/81J+QP3HWIL._AC_SL1500_.jpg',
            imagenes: [
                'https://m.media-amazon.com/images/I/81J+QP3HWIL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/819y6l5WVUL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/81RJ9mKLMQL._AC_SL1500_.jpg'
            ],
            stock: 15,
            estado: true,
            descuento: 10
        };

        // Producto 2: Edredón con 4 imágenes
        const producto2 = {
            nombre: 'Edredón King Size Luxury',
            descripcion: 'Edredón de lujo con relleno de fibra sintética de alta densidad. Incluye fundas de almohada.',
            precio_base: 180.00,
            categoria: 'EDREDONES',
            subcategoria: 'KING SIZE',
            imagen_principal: 'https://m.media-amazon.com/images/I/81ykw6GMSYL._AC_SL1500_.jpg',
            imagenes: [
                'https://m.media-amazon.com/images/I/81ykw6GMSYL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/91cUGfGq1pL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/81vNKPQqz7L._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/81-5JKnLb8L._AC_SL1500_.jpg'
            ],
            stock: 8,
            estado: true,
            descuento: 15
        };

        // Producto 3: Juego de sábanas con 5 imágenes
        const producto3 = {
            nombre: 'Juego de Sábanas Microfibra',
            descripcion: 'Set completo de sábanas en microfibra ultra suave. Incluye sábana, funda de almohada y elástico.',
            precio_base: 120.00,
            categoria: 'SABANAS',
            subcategoria: '2 PLAZAS',
            imagen_principal: 'https://m.media-amazon.com/images/I/91H0B9zVPkL._AC_SL1500_.jpg',
            imagenes: [
                'https://m.media-amazon.com/images/I/91H0B9zVPkL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/81z8kGgx1vL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/81BQqY7DVOL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/81VpUYR0SyL._AC_SL1500_.jpg',
                'https://m.media-amazon.com/images/I/91WbFOaZc3L._AC_SL1500_.jpg'
            ],
            stock: 20,
            estado: true,
            descuento: 5
        };

        // Insertar productos
        const productos = [producto1, producto2, producto3];

        for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];
            
            console.log(`📦 Insertando: ${producto.nombre}`);
            
            await pool.query(`
                INSERT INTO productos (
                    nombre, descripcion, precio_base, categoria, subcategoria,
                    imagen_principal, imagenes, stock, estado, descuento
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                producto.nombre,
                producto.descripcion,
                producto.precio_base,
                producto.categoria,
                producto.subcategoria,
                producto.imagen_principal,
                producto.imagenes, // PostgreSQL manejará automáticamente el array
                producto.stock,
                producto.estado,
                producto.descuento
            ]);
            
            console.log(`✅ ${producto.nombre} insertado con ${producto.imagenes.length} imágenes`);
        }

        await pool.query('COMMIT');
        console.log('\n🎉 ¡Productos con carrusel agregados exitosamente!');
        
        // Mostrar resumen
        const result = await pool.query('SELECT COUNT(*) FROM productos');
        console.log(`📊 Total de productos en BD: ${result.rows[0].count}`);

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
};

agregarProductosConCarrusel();