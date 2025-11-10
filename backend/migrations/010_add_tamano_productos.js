const pool = require('../src/db/database');

async function addTamanoColumn() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Iniciando migración: Agregar columna tamaño a productos...\n');
        
        await client.query('BEGIN');
        
        // Verificar si la columna ya existe
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'productos' AND column_name = 'tamano'
        `);
        
        if (checkColumn.rows.length > 0) {
            console.log('⚠️  La columna "tamano" ya existe en la tabla productos');
            await client.query('ROLLBACK');
            return;
        }
        
        // Agregar la columna tamaño
        await client.query(`
            ALTER TABLE productos 
            ADD COLUMN tamano VARCHAR(50)
        `);
        
        console.log('✅ Columna "tamano" agregada exitosamente');
        
        // Crear índice para búsquedas más rápidas
        await client.query(`
            CREATE INDEX idx_productos_tamano ON productos(tamano)
        `);
        
        console.log('✅ Índice creado para la columna "tamano"');
        
        await client.query('COMMIT');
        
        console.log('\n📊 Migración completada exitosamente');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error en la migración:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar migración
addTamanoColumn();
