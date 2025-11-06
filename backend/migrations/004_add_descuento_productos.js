const pool = require('../src/db/database');

async function addDescuentoToProductos() {
    try {
        // Agregar columna descuento
        await pool.query(`
            ALTER TABLE productos
            ADD COLUMN IF NOT EXISTS descuento NUMERIC(5,2) DEFAULT 0
            CHECK (descuento >= 0 AND descuento <= 100);
        `);

        console.log('✅ Campo descuento agregado a la tabla productos');
    } catch (error) {
        console.error('Error en la migración:', error);
        throw error;
    }
}

module.exports = addDescuentoToProductos;