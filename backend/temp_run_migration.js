const pool = require('./src/db/database');
const migration = require('./migrations/009_create_config_table.js');

async function run() {
    console.log('🚀 Ejecutando migración manualmente...');
    try {
        await migration.up(pool);
        console.log('✅ Migración manual completada.');
    } catch (error) {
        console.error('❌ Error en la migración manual:', error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

run();