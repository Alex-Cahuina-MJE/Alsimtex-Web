const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const revisarProductosExistentes = async () => {
    try {
        console.log('🔍 REVISANDO PRODUCTOS EXISTENTES:\n');
        
        const result = await pool.query(`
            SELECT 
                id,
                nombre, 
                imagen_principal,
                imagenes,
                array_length(imagenes, 1) as num_imgs
            FROM productos 
            WHERE id <= 9
            ORDER BY id
        `);

        result.rows.forEach(producto => {
            console.log(`📦 ID ${producto.id}: ${producto.nombre}`);
            console.log(`   🖼️  imagen_principal: ${producto.imagen_principal ? 'SÍ' : 'NO'}`);
            console.log(`   📷 imagenes array: ${producto.imagenes ? 'SÍ' : 'NO'} (${producto.num_imgs || 0} items)`);
            
            if (producto.imagenes && producto.imagenes.length > 0) {
                console.log(`   📋 Lista de imágenes:`);
                producto.imagenes.forEach((img, index) => {
                    console.log(`      ${index + 1}. ${img.substring(0, 60)}...`);
                });
            }
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
};

revisarProductosExistentes();