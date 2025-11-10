const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

// URL de imagen placeholder
const PLACEHOLDER_IMAGE = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

// Función para mapear el tamaño del modelo
function mapearTamano(modelo) {
    const mapeoTamanos = {
        '1 PLAZA': '1P',
        '1 1/2 PLAZA': '1.5P',
        '2 PLAZAS': '2P',
        'QUEEN': 'QUEEN',
        'KING': 'KING'
    };
    return mapeoTamanos[modelo] || '';
}

// Función para mapear la categoría a subcategoría válida
function mapearCategoria(subcategoria) {
    const mapeoCategoria = {
        'SABANAS': 'SABANAS',
        'COBERTORES': 'COBERTORES',
        'EDREDRONES': 'EDREDONES',
        'PROTECTORES': 'PROTECTORES',
        'FUNDAS DE COLCHON': 'FUNDAS',
        'FRAZADAS': 'FRAZADAS',
        'DUVET': 'DUVET',
        'SERVICIO': 'OTROS',
        'PRODUCTO': 'OTROS',
        'RESPALDOS': 'OTROS',
        'ALMOHADAS': 'OTROS'
    };
    return mapeoCategoria[subcategoria] || 'OTROS';
}

async function agregarProductos() {
    let client;
    
    try {
        console.log('🔄 Conectando a la base de datos...');
        client = await pool.connect();
        console.log('✅ Conexión establecida\n');

        // Leer el archivo productos.md
        console.log('📖 Leyendo archivo productos.md...');
        const productosPath = path.join(__dirname, '..', 'productos.md');
        const contenido = await fs.readFile(productosPath, 'utf-8');
        
        // Limpiar el contenido si tiene markdown markers
        let contenidoLimpio = contenido.trim();
        if (contenidoLimpio.startsWith('```')) {
            contenidoLimpio = contenidoLimpio.replace(/^```[^\n]*\n/, '').replace(/\n```$/, '');
        }
        
        const productos = JSON.parse(contenidoLimpio);
        console.log(`✅ Se encontraron ${productos.length} productos\n`);

        // Verificar qué productos ya existen
        console.log('🔍 Verificando productos existentes...');
        const existentes = await client.query(
            'SELECT codigo FROM productos'
        );
        const codigosExistentes = new Set(existentes.rows.map(p => p.codigo));
        console.log(`📊 Productos existentes en BD: ${codigosExistentes.size}\n`);

        let agregados = 0;
        let omitidos = 0;
        let errores = 0;

        console.log('📝 Iniciando inserción de productos...\n');

        for (const producto of productos) {
            const codigo = producto.ID_Producto || producto.Código_Barras;
            
            // Verificar si el producto ya existe
            if (codigosExistentes.has(codigo)) {
                console.log(`⏭️  Omitiendo ${codigo} - ${producto.Nombre_Producto} (ya existe)`);
                omitidos++;
                continue;
            }

            try {
                const nombre = producto.Nombre_Producto || '';
                const descripcion = producto.Descripción_Corta || producto.Nombre_Producto || '';
                const categoria = mapearCategoria(producto.Subcategoría || '');
                const tamano = mapearTamano(producto.Modelo || '');
                
                // Preparar las imágenes
                const imagenes = JSON.stringify([PLACEHOLDER_IMAGE]);

                // Insertar el producto
                await client.query(
                    `INSERT INTO productos 
                    (codigo, nombre, descripcion, precio, stock, categoria, tamano, 
                     imagen_url, imagenes, descuento, activo, fecha_creacion) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
                    [
                        codigo,
                        nombre,
                        descripcion,
                        100, // precio
                        0,   // stock
                        categoria,
                        tamano,
                        PLACEHOLDER_IMAGE, // imagen_url principal
                        imagenes, // array de imágenes
                        0,   // descuento
                        true // activo
                    ]
                );

                console.log(`✅ Agregado: ${codigo} - ${nombre}`);
                agregados++;

            } catch (error) {
                console.error(`❌ Error al agregar ${codigo}: ${error.message}`);
                errores++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE LA OPERACIÓN');
        console.log('='.repeat(60));
        console.log(`✅ Productos agregados: ${agregados}`);
        console.log(`⏭️  Productos omitidos (ya existían): ${omitidos}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`📦 Total procesados: ${productos.length}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error general:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log('\n✅ Conexión liberada');
        }
        await pool.end();
    }
}

// Ejecutar el script
console.log('🚀 SCRIPT DE IMPORTACIÓN DE PRODUCTOS');
console.log('='.repeat(60));
console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
console.log('='.repeat(60) + '\n');

agregarProductos()
    .then(() => {
        console.log('\n✅ Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ El script finalizó con errores:', error.message);
        process.exit(1);
    });
