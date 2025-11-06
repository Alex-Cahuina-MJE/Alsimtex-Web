const { Pool } = require('pg');

// Migración para agregar la columna documento_pago a la tabla pedidos
const migration = {
  up: async (pool) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Agregar columna para el documento de pago
      await client.query(`
        ALTER TABLE pedidos 
        ADD COLUMN IF NOT EXISTS documento_pago VARCHAR(255);
      `);
      
      // Agregar comentario a la nueva columna
      await client.query(`
        COMMENT ON COLUMN pedidos.documento_pago 
        IS 'Ruta del archivo del comprobante de pago subido por el cliente';
      `);
      
      await client.query('COMMIT');
      console.log('✅ Migración 008: Columna documento_pago agregada correctamente');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en migración 008:', error.message);
      throw error;
    } finally {
      client.release();
    }
  },
  
  down: async (pool) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Eliminar la columna documento_pago
      await client.query(`
        ALTER TABLE pedidos 
        DROP COLUMN IF EXISTS documento_pago;
      `);
      
      await client.query('COMMIT');
      console.log('✅ Rollback 008: Columna documento_pago eliminada correctamente');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en rollback 008:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = migration;