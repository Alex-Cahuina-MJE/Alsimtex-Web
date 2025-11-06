    const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const resetProductosTable = async() => {
    try {
        await pool.query('BEGIN');

        // 1. Hacer backup de los datos existentes
        console.log('Creando backup de datos...');
        const result = await pool.query(`
            CREATE TEMP TABLE productos_backup AS
            SELECT 
                id,
                nombre,
                descripcion,
                precio_base,
                categoria,
                subcategoria,
                imagenes,
                imagen_principal,
                stock,
                estado,
                descuento,
                created_at,
                updated_at
            FROM productos;
        `);

        // 2. Eliminar la tabla actual
        console.log('Eliminando tabla actual...');
        await pool.query('DROP TABLE productos;');

        // 3. Crear la tabla con la estructura correcta
        console.log('Creando nueva tabla...');
        await pool.query(`
            CREATE TABLE productos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                precio_base NUMERIC(10,2) NOT NULL,
                categoria VARCHAR(50) NOT NULL,
                subcategoria VARCHAR(50),
                imagenes TEXT[],
                imagen_principal TEXT,
                stock INTEGER DEFAULT 0,
                estado BOOLEAN DEFAULT true,
                descuento NUMERIC(5,2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Restaurar los datos
        console.log('Restaurando datos...');
        await pool.query(`
            INSERT INTO productos (
                id, nombre, descripcion, precio_base, categoria, subcategoria,
                imagenes, imagen_principal, stock, estado, descuento,
                created_at, updated_at
            )
            SELECT * FROM productos_backup;
        `);

        // 5. Restaurar la secuencia del id
        await pool.query(`
            SELECT setval('productos_id_seq', COALESCE((SELECT MAX(id) FROM productos), 1));
        `);

        // 6. Confirmar cambios
        await pool.query('COMMIT');
        console.log('✅ Tabla productos reconstruida exitosamente');

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error reconstruyendo tabla:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

// Ejecutar la reconstrucción
resetProductosTable()
    .then(() => console.log('Proceso completado'))
    .catch(error => {
        console.error('Error en el proceso:', error);
        process.exit(1);
    });