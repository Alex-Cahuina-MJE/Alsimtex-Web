const pool = require('./src/db/database');

async function verificarCampoTamano() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Verificando campo "tamano" en la tabla productos...\n');
        
        // Verificar que la columna existe
        const checkColumn = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'productos' AND column_name = 'tamano'
        `);
        
        if (checkColumn.rows.length === 0) {
            console.log('❌ El campo "tamano" no existe en la tabla productos');
            return;
        }
        
        console.log('✅ Campo "tamano" existe en la tabla productos');
        console.log(`   Tipo de dato: ${checkColumn.rows[0].data_type}\n`);
        
        // Obtener estadísticas de productos con tamaño
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_productos,
                COUNT(tamano) as productos_con_tamano,
                COUNT(*) - COUNT(tamano) as productos_sin_tamano
            FROM productos
        `);
        
        console.log('📊 Estadísticas:');
        console.log(`   Total de productos: ${stats.rows[0].total_productos}`);
        console.log(`   Productos con tamaño: ${stats.rows[0].productos_con_tamano}`);
        console.log(`   Productos sin tamaño: ${stats.rows[0].productos_sin_tamano}\n`);
        
        // Obtener tamaños únicos
        const tamanos = await client.query(`
            SELECT DISTINCT tamano, COUNT(*) as cantidad
            FROM productos 
            WHERE tamano IS NOT NULL
            GROUP BY tamano
            ORDER BY tamano
        `);
        
        console.log('📏 Tamaños disponibles:');
        tamanos.rows.forEach(row => {
            console.log(`   ${row.tamano}: ${row.cantidad} productos`);
        });
        
        console.log('\n✅ Verificación completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar verificación
verificarCampoTamano();
