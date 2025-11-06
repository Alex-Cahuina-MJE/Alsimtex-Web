const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const checkProductsTable = async() => {
    try {
        // Verificar la estructura de la tabla
        console.log('Estructura de la tabla productos:');
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'productos'
            ORDER BY ordinal_position;
        `);
        console.table(structure.rows);

        // Verificar contenido de la tabla
        console.log('\nContenido de la tabla productos:');
        const content = await pool.query('SELECT * FROM productos;');
        console.table(content.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkProductsTable();