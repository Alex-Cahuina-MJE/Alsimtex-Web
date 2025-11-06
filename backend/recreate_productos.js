const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const recreateProductosTable = async() => {
    try {
        await pool.query('BEGIN');

        // Eliminar la tabla si existe
        await pool.query(`
            DROP TABLE IF EXISTS productos CASCADE;
        `);

        // Crear la tabla con la estructura actualizada
        await pool.query(`
            CREATE TABLE productos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                precio_base NUMERIC NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                subcategoria VARCHAR(100),
                imagenes TEXT[],
                imagen_principal TEXT,
                stock INTEGER DEFAULT 0,
                estado BOOLEAN DEFAULT true,
                descuento NUMERIC(5,2) DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Crear un trigger para actualizar updated_at
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        await pool.query(`
            CREATE TRIGGER update_productos_updated_at
                BEFORE UPDATE ON productos
                FOR EACH ROW
                EXECUTE PROCEDURE update_updated_at_column();
        `);

        await pool.query('COMMIT');
        console.log('✅ Tabla productos recreada exitosamente');

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error recreando la tabla productos:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

recreateProductosTable()
    .then(() => console.log('Proceso completado'))
    .catch(error => {
        console.error('Error en el proceso:', error);
        process.exit(1);
    });