const pool = require('../src/db/database');

async function up() {
    const client = await pool.connect();
    
    try {
        console.log('Agregando columna tipo_entrega a tabla pedidos...');
        
        await client.query(`
            ALTER TABLE pedidos 
            ADD COLUMN IF NOT EXISTS tipo_entrega VARCHAR(20) DEFAULT 'envio' CHECK (tipo_entrega IN ('envio', 'recojo'))
        `);
        
        console.log('✓ Columna tipo_entrega agregada exitosamente');
        
        // Actualizar pedidos existentes para que tengan el valor por defecto
        await client.query(`
            UPDATE pedidos 
            SET tipo_entrega = 'envio' 
            WHERE tipo_entrega IS NULL
        `);
        
        console.log('✓ Pedidos existentes actualizados');
        
        // Hacer que direccion_envio sea nullable (ya que no es requerido para recojo)
        await client.query(`
            ALTER TABLE pedidos 
            ALTER COLUMN direccion_envio DROP NOT NULL
        `);
        
        console.log('✓ Columna direccion_envio actualizada a nullable');
        
    } catch (error) {
        console.error('Error en migración:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function down() {
    const client = await pool.connect();
    
    try {
        console.log('Revirtiendo migración tipo_entrega...');
        
        await client.query(`
            ALTER TABLE pedidos 
            DROP COLUMN IF EXISTS tipo_entrega
        `);
        
        console.log('✓ Columna tipo_entrega eliminada');
        
    } catch (error) {
        console.error('Error al revertir migración:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
    up()
        .then(() => {
            console.log('✅ Migración completada exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error en la migración:', error);
            process.exit(1);
        });
}

module.exports = { up, down };
