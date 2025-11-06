const fs = require('fs');
const path = require('path');
const pool = require('./src/db/database');

async function runMigration() {
    try {
        console.log('🚀 Iniciando migración de base de datos...');
        
        // Leer el archivo SQL
        const sqlFilePath = path.join(__dirname, 'migrations', 'create_pedidos_tables.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Ejecutar el SQL
        await pool.query(sql);
        
        console.log('✅ Migración completada exitosamente');
        console.log('✅ Tablas creadas: pedidos, pedido_items');
        console.log('✅ Índices creados correctamente');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al ejecutar la migración:', error);
        process.exit(1);
    }
}

runMigration();
