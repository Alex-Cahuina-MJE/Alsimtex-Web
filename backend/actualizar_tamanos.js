const pool = require('./src/db/database');

async function actualizarTamanos() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Iniciando actualización de tamaños en productos...\n');
        
        await client.query('BEGIN');
        
        // Obtener todos los productos
        const result = await client.query('SELECT id, nombre FROM productos ORDER BY id');
        
        let actualizados = 0;
        
        for (const producto of result.rows) {
            let tamano = null;
            
            // Extraer el tamaño del nombre del producto
            if (producto.nombre.includes('1 1/2 PLAZA')) {
                tamano = '1 1/2 PLAZA';
            } else if (producto.nombre.includes('1.5P')) {
                tamano = '1 1/2 PLAZA';
            } else if (producto.nombre.includes('2 PLAZAS')) {
                tamano = '2 PLAZAS';
            } else if (producto.nombre.includes('2P')) {
                tamano = '2 PLAZAS';
            } else if (producto.nombre.includes('1 PLAZA')) {
                tamano = '1 PLAZA';
            } else if (producto.nombre.includes('1P')) {
                tamano = '1 PLAZA';
            } else if (producto.nombre.includes('QUEEN')) {
                tamano = 'QUEEN';
            } else if (producto.nombre.includes('KING')) {
                tamano = 'KING';
            }
            
            if (tamano) {
                await client.query(
                    'UPDATE productos SET tamano = $1 WHERE id = $2',
                    [tamano, producto.id]
                );
                actualizados++;
                console.log(`✅ ID ${producto.id}: ${producto.nombre} → Tamaño: ${tamano}`);
            } else {
                console.log(`⚠️  ID ${producto.id}: ${producto.nombre} → Sin tamaño detectado`);
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n📊 Resumen:');
        console.log(`   ✅ Productos actualizados: ${actualizados}`);
        console.log(`   📦 Total procesados: ${result.rows.length}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error actualizando tamaños:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar
actualizarTamanos();
