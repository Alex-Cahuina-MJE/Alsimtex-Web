const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'BDalsimtex',
  port: process.env.DB_PORT || 5432
});

async function analyzeProducts() {
  try {
    console.log('📊 ANÁLISIS DE PRODUCTOS EN LA BASE DE DATOS\n');
    
    // Ver todos los productos
    const allProducts = await pool.query(`
      SELECT id, nombre, imagen_principal, imagenes, 
             CASE 
               WHEN imagenes IS NULL THEN 0
               ELSE array_length(imagenes, 1)
             END as total_imagenes_array,
             CASE 
               WHEN imagen_principal IS NOT NULL AND imagenes IS NOT NULL AND array_length(imagenes, 1) > 0 THEN 
                 1 + array_length(imagenes, 1)
               WHEN imagen_principal IS NOT NULL THEN 1
               WHEN imagenes IS NOT NULL THEN array_length(imagenes, 1)
               ELSE 0
             END as total_imagenes_disponibles
      FROM productos 
      ORDER BY id
    `);
    
    console.log('🏷️ RESUMEN POR PRODUCTO:');
    console.log('=====================================');
    
    let singleImageCount = 0;
    let multipleImageCount = 0;
    
    allProducts.rows.forEach(producto => {
      const hasMain = producto.imagen_principal ? '✅' : '❌';
      const arrayCount = producto.total_imagenes_array || 0;
      const totalImages = producto.total_imagenes_disponibles;
      
      console.log(`${producto.id}. ${producto.nombre}`);
      console.log(`   Imagen principal: ${hasMain} ${producto.imagen_principal ? '(SI)' : '(NO)'}`);
      console.log(`   Array imágenes: ${arrayCount} imágenes`);
      console.log(`   🎯 TOTAL DISPONIBLES: ${totalImages} imágenes`);
      console.log(`   📋 Estado: ${totalImages > 1 ? '✅ MÚLTIPLE (selector activo)' : '⚠️ ÚNICA (directo al carrito)'}`);
      console.log('');
      
      if (totalImages > 1) {
        multipleImageCount++;
      } else {
        singleImageCount++;
      }
    });
    
    console.log('📈 ESTADÍSTICAS GENERALES:');
    console.log('=====================================');
    console.log(`📦 Total productos: ${allProducts.rows.length}`);
    console.log(`🎨 Con múltiples imágenes: ${multipleImageCount} (selector de diseño activo)`);
    console.log(`📸 Con una sola imagen: ${singleImageCount} (agregar directo)`);
    console.log(`📊 Porcentaje con selector: ${((multipleImageCount / allProducts.rows.length) * 100).toFixed(1)}%`);
    
    console.log('\n🔧 RECOMENDACIÓN:');
    if (multipleImageCount < 3) {
      console.log('⚠️ Pocos productos tienen múltiples imágenes.');
      console.log('💡 Para probar el selector, podemos agregar imágenes adicionales a más productos.');
      console.log('🎯 ¿Quieres que agregue 2-3 imágenes a todos los productos para testing?');
    } else {
      console.log('✅ Hay suficientes productos con múltiples imágenes para probar el selector.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

analyzeProducts();