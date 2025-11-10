const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '12345',
    database: 'alsimtex_db',
    port: 5432
});

async function verificarProductos() {
    let client;
    
    try {
        client = await pool.connect();
        
        const result = await client.query(`
            SELECT codigo, nombre, precio, stock, categoria 
            FROM productos 
            ORDER BY codigo
        `);
        
        console.log(`Total de productos en la base de datos: ${result.rows.length}\n`);
        console.log('Primeros 10 productos:');
        result.rows.slice(0, 10).forEach(p => {
            console.log(`  ${p.codigo} - ${p.nombre} - Precio: $${p.precio} - Stock: ${p.stock}`);
        });
        
        console.log('\nÚltimos 10 productos:');
        result.rows.slice(-10).forEach(p => {
            console.log(`  ${p.codigo} - ${p.nombre} - Precio: $${p.precio} - Stock: ${p.stock}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

verificarProductos();
