const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const actualizarProductoFrazadas = async () => {
    try {
        console.log('🔄 Actualizando producto Frazadas para mejor prueba del carrusel...\n');
        
        // Actualizar el producto Frazadas (ID 2) con más imágenes
        await pool.query(`
            UPDATE productos 
            SET 
                imagenes = ARRAY[
                    'https://dcdn-us.mitiendanube.com/stores/089/625/products/min_wm_dsc_0001-15-dda70c3bce6c5af0b616998987066932-1024-1024.jpg',
                    'https://http2.mlstatic.com/D_NQ_NP_619476-MLU78559923757_082024-O.jpg',
                    'https://m.media-amazon.com/images/I/81J+QP3HWIL._AC_SL1500_.jpg',
                    'https://m.media-amazon.com/images/I/819y6l5WVUL._AC_SL1500_.jpg'
                ],
                descripcion = 'Frazadas de alta calidad con múltiples diseños. Perfectas para el clima de Arequipa. Material suave y duradero.'
            WHERE id = 2
        `);

        console.log('✅ Producto Frazadas actualizado con 4 imágenes');

        // Agregar otro producto con múltiples imágenes usando imágenes locales
        await pool.query(`
            INSERT INTO productos (
                nombre, descripcion, precio_base, categoria, subcategoria,
                imagen_principal, imagenes, stock, descuento, estado
            ) VALUES (
                'Colcha Matrimonial Premium',
                'Colcha elegante para cama matrimonial. Incluye fundas de almohada a juego.',
                95.00,
                'COLCHAS',
                '2 PLAZAS',
                'https://isatexhome.com/cdn/shop/files/IMG-0007.jpg?v=17436218766061734621876',
                ARRAY[
                    'https://isatexhome.com/cdn/shop/files/IMG-0007.jpg?v=17436218766061734621876',
                    'https://media.falabella.com/falabellaPE/121743266_01/w=1500,h=1500,f=webp',
                    'https://dcdn-us.mitiendanube.com/stores/089/625/products/min_wm_dsc_0001-15-dda70c3bce6c5af0b616998987066932-1024-1024.jpg'
                ],
                12,
                8,
                true
            )
        `);

        console.log('✅ Nuevo producto "Colcha Matrimonial Premium" agregado con 3 imágenes');

        // Verificar resultados
        const verificacion = await pool.query(`
            SELECT 
                nombre, 
                array_length(imagenes, 1) as num_imgs
            FROM productos 
            WHERE array_length(imagenes, 1) > 1
            ORDER BY id
        `);

        console.log('\n🎠 PRODUCTOS CON CARRUSEL ACTIVO:');
        verificacion.rows.forEach(p => {
            console.log(`  ✅ ${p.nombre}: ${p.num_imgs} imágenes`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
};

actualizarProductoFrazadas();