const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'BDalsimtex',
  port: process.env.DB_PORT || 5432
});

async function addMultipleImagesToProducts() {
  try {
    console.log('🔧 Agregando múltiples imágenes a productos existentes...');
    
    // Actualizar el producto Juego de Sábanas (ID 12) con múltiples imágenes
    const updateSabanas = await pool.query(`
      UPDATE productos 
      SET imagenes = ARRAY[
        'https://m.media-amazon.com/images/I/81uLhTgv6NL._AC_SL1500_.jpg',
        'https://m.media-amazon.com/images/I/91QTtC6M0OL._AC_SL1500_.jpg',
        'https://m.media-amazon.com/images/I/81DIYvheQXL._AC_SL1500_.jpg'
      ]
      WHERE id = 12 AND nombre ILIKE '%sabana%'
    `);
    
    // Actualizar el producto Edredón (ID 11) con múltiples imágenes
    const updateEdredon = await pool.query(`
      UPDATE productos 
      SET imagenes = ARRAY[
        'https://m.media-amazon.com/images/I/81YMjy4oEQL._AC_SL1500_.jpg',
        'https://m.media-amazon.com/images/I/81JjGC9yCYL._AC_SL1500_.jpg',
        'https://m.media-amazon.com/images/I/71r4oQGI7AL._AC_SL1500_.jpg',
        'https://m.media-amazon.com/images/I/81f0zWqcuYL._AC_SL1500_.jpg'
      ]
      WHERE id = 11 AND nombre ILIKE '%edredon%'
    `);
    
    // Verificar productos actualizados
    const result = await pool.query(`
      SELECT id, nombre, imagen_principal, imagenes, 
             array_length(imagenes, 1) as total_imagenes
      FROM productos 
      WHERE array_length(imagenes, 1) > 1
      ORDER BY id
    `);
    
    console.log('✅ Productos con múltiples imágenes:');
    result.rows.forEach(producto => {
      console.log(`${producto.id}. ${producto.nombre} - ${producto.total_imagenes} imágenes`);
      console.log(`   Imagen principal: ${producto.imagen_principal}`);
      console.log(`   Imágenes adicionales: ${producto.imagenes.length} items`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

addMultipleImagesToProducts();