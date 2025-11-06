const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'BDalsimtex',
  port: process.env.DB_PORT || 5432
});

async function checkProduct() {
  try {
    const result = await pool.query('SELECT id, nombre, imagen_principal, imagenes FROM productos WHERE nombre ILIKE \'%frazada%\' LIMIT 1');
    
    if (result.rows.length > 0) {
      const producto = result.rows[0];
      console.log('=== PRODUCTO FRAZADA ACTUAL ===');
      console.log('ID:', producto.id);
      console.log('Nombre:', producto.nombre);
      console.log('Imagen Principal:', producto.imagen_principal);
      console.log('Array de Imágenes:', producto.imagenes);
      console.log('Cantidad de imágenes en array:', producto.imagenes ? producto.imagenes.length : 0);
      console.log('');
      
      if (producto.imagenes && producto.imagenes.length > 0) {
        console.log('Imágenes en el array:');
        producto.imagenes.forEach((img, index) => {
          console.log(`  ${index + 1}. ${img}`);
        });
      }
    } else {
      console.log('No se encontró producto con "frazada" en el nombre');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

checkProduct();