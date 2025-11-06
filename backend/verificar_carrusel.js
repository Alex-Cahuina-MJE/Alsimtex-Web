const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const verificarCarrusel = async () => {
    try {
        console.log('🎠 VERIFICANDO PRODUCTOS CON CARRUSEL:\n');
        
        const result = await pool.query(`
            SELECT 
                nombre, 
                array_length(imagenes, 1) as num_imgs,
                imagenes[1] as primera_img
            FROM productos 
            WHERE array_length(imagenes, 1) > 1
            ORDER BY id DESC
        `);

        if (result.rows.length === 0) {
            console.log('❌ No hay productos con múltiples imágenes');
        } else {
            result.rows.forEach(producto => {
                console.log(`✅ ${producto.nombre}`);
                console.log(`   📷 ${producto.num_imgs} imágenes`);
                console.log(`   🖼️  Primera: ${producto.primera_img.substring(0, 50)}...`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
};

verificarCarrusel();