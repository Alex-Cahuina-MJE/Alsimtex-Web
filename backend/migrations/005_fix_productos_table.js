const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const updateTableStructure = async() => {
    try {
        // Iniciar transacción
        await pool.query('BEGIN');

        // 1. Hacer backup de los datos importantes
        const result = await pool.query(`
            CREATE TEMP TABLE productos_backup AS
            SELECT id, nombre, descripcion, precio_base, categoria, subcategoria,
                   imagenes, imagen_principal, stock, estado, descuento,
                   created_at, updated_at
            FROM productos;
        `);

        // 2. Eliminar la tabla actual
        await pool.query('DROP TABLE productos;');

        // 3. Crear la tabla con la estructura correcta
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
            SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos));
        `);

        // Confirmar transacción
        await pool.query('COMMIT');

        console.log('✅ Tabla productos actualizada exitosamente');
    } catch (error) {
        // Revertir cambios en caso de error
        await pool.query('ROLLBACK');
        console.error('❌ Error actualizando la tabla:', error);
        throw error;
    } finally {
        // Cerrar la conexión
        await pool.end();
    }
};

// Ejecutar la actualización
updateTableStructure()
    .then(() => console.log('Actualización finalizada'))
    .catch(error => {
        console.error('Error ejecutando la actualización:', error);
        process.exit(1);
    });