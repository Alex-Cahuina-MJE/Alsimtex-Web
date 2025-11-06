const { Pool } = require('pg');

// Migración para crear la tabla de configuración de la empresa
const migration = {
  up: async (pool) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Crear tabla para configuraciones generales (llave-valor)
      await client.query(`
        CREATE TABLE IF NOT EXISTS empresa_configuracion (
            id SERIAL PRIMARY KEY,
            clave VARCHAR(100) NOT NULL UNIQUE,
            valor TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Comentario en la tabla
      await client.query(`
        COMMENT ON TABLE empresa_configuracion IS '''Almacena configuraciones generales de la empresa (llave-valor), como colores de tema, etc.''';
      `);

      // Insertar el color primario por defecto si no existe
      await client.query(`
        INSERT INTO empresa_configuracion (clave, valor)
        VALUES ('primary_color', '#059669')
        ON CONFLICT (clave) DO NOTHING;
      `);

      await client.query('COMMIT');
      console.log('✅ Migración 009: Tabla empresa_configuracion creada y valor por defecto insertado');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en migración 009:', error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  down: async (pool) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar la tabla empresa_configuracion
      await client.query('DROP TABLE IF EXISTS empresa_configuracion;');

      await client.query('COMMIT');
      console.log('✅ Rollback 009: Tabla empresa_configuracion eliminada');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en rollback 009:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = migration;