const pool = require('./src/db/database');

// URL de imagen por defecto
const IMAGEN_DEFAULT = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

// Productos a agregar
const productos = [
    {
        nombre: "SABANA POLAR 2P",
        descripcion: "SABANA POLAR 2P",
        categoria: "SABANAS",
        subcategoria: "POLAR",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "SABANA POLAR PIEZADA 2P",
        descripcion: "SABANA POLAR PIEZADA 2P",
        categoria: "SABANAS",
        subcategoria: "POLAR",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "SABANA POLAR QUEEN",
        descripcion: "SABANA POLAR QUEEN",
        categoria: "SABANAS",
        subcategoria: "POLAR",
        modelo: "QUEEN"
    },
    {
        nombre: "SABANA POLAR KING",
        descripcion: "SABANA POLAR KING",
        categoria: "SABANAS",
        subcategoria: "POLAR",
        modelo: "KING"
    },
    {
        nombre: "SABANA CHINA 1.5P 80GR COLOR ENTERO",
        descripcion: "SABANA CHINA 1.5P 80GR COLOR ENTERO",
        categoria: "SABANAS",
        subcategoria: "CHINA",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "SABANA CHINA 2P 80GR COLOR ENTERO",
        descripcion: "SABANA CHINA 2P 80GR COLOR ENTERO",
        categoria: "SABANAS",
        subcategoria: "CHINA",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "SABANA SAN JACINTO 1.5P",
        descripcion: "SABANA SAN JACINTO 1.5P",
        categoria: "SABANAS",
        subcategoria: "SAN JACINTO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "SABANA SAN JACINTO 2P",
        descripcion: "SABANA SAN JACINTO 2P",
        categoria: "SABANAS",
        subcategoria: "SAN JACINTO",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "SABANA SAN JACINTO QUEEN",
        descripcion: "SABANA SAN JACINTO QUEEN",
        categoria: "SABANAS",
        subcategoria: "SAN JACINTO",
        modelo: "QUEEN"
    },
    {
        nombre: "SABANA SAN JACINTO KING",
        descripcion: "SABANA SAN JACINTO KING",
        categoria: "SABANAS",
        subcategoria: "SAN JACINTO",
        modelo: "KING"
    },
    {
        nombre: "COBERTOR BP 1.5P ANCHO 1.7",
        descripcion: "COBERTOR BP 1.5P ANCHO 1.7",
        categoria: "COBERTORES",
        subcategoria: "BP",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR BP 1.5P ANCHO 1.9",
        descripcion: "COBERTOR BP 1.5P ANCHO 1.9",
        categoria: "COBERTORES",
        subcategoria: "BP",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR BP 2P ANCHO 2.1",
        descripcion: "COBERTOR BP 2P ANCHO 2.1",
        categoria: "COBERTORES",
        subcategoria: "BP",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR BP 2P ANCHO 2.3",
        descripcion: "COBERTOR BP 2P ANCHO 2.3",
        categoria: "COBERTORES",
        subcategoria: "BP",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR BP QUEEN ANCHO 2.6",
        descripcion: "COBERTOR BP QUEEN ANCHO 2.6",
        categoria: "COBERTORES",
        subcategoria: "BP",
        modelo: "QUEEN"
    },
    {
        nombre: "COBERTOR BP KING ANCHO 2.9",
        descripcion: "COBERTOR BP KING ANCHO 2.9",
        categoria: "COBERTORES",
        subcategoria: "BP",
        modelo: "KING"
    },
    {
        nombre: "COBERTOR BP+CARNERO 1.5P ANCHO 1.7",
        descripcion: "COBERTOR BP+CARNERO 1.5P ANCHO 1.7",
        categoria: "COBERTORES",
        subcategoria: "BP+CARNERO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR BP+CARNERO 1.5P ANCHO 1.9",
        descripcion: "COBERTOR BP+CARNERO 1.5P ANCHO 1.9",
        categoria: "COBERTORES",
        subcategoria: "BP+CARNERO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR BP+CARNERO 2P ANCHO 2.1",
        descripcion: "COBERTOR BP+CARNERO 2P ANCHO 2.1",
        categoria: "COBERTORES",
        subcategoria: "BP+CARNERO",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR BP+CARNERO 2P ANCHO 2.3",
        descripcion: "COBERTOR BP+CARNERO 2P ANCHO 2.3",
        categoria: "COBERTORES",
        subcategoria: "BP+CARNERO",
        modelo: "2 PLAZAS"
    }
];

async function agregarProductos() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🚀 Iniciando inserción de productos...\n');
        
        let insertados = 0;
        let errores = 0;
        
        for (const producto of productos) {
            try {
                // Verificar si el producto ya existe
                const existe = await client.query(
                    'SELECT id FROM productos WHERE nombre = $1',
                    [producto.nombre]
                );
                
                if (existe.rows.length > 0) {
                    console.log(`⚠️  Producto ya existe: ${producto.nombre}`);
                    continue;
                }
                
                // Insertar el producto
                const result = await client.query(
                    `INSERT INTO productos 
                    (nombre, descripcion, precio_base, categoria, subcategoria, 
                     imagenes, imagen_principal, stock, estado, descuento)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING id, nombre`,
                    [
                        producto.nombre,
                        producto.descripcion,
                        100, // precio_base
                        producto.categoria,
                        producto.subcategoria,
                        [IMAGEN_DEFAULT], // imagenes array
                        IMAGEN_DEFAULT, // imagen_principal
                        0, // stock
                        true, // estado
                        0 // descuento
                    ]
                );
                
                insertados++;
                console.log(`✅ Insertado: ${result.rows[0].nombre} (ID: ${result.rows[0].id})`);
            } catch (error) {
                errores++;
                console.error(`❌ Error insertando ${producto.nombre}:`, error.message);
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n📊 Resumen:');
        console.log(`   ✅ Productos insertados: ${insertados}`);
        console.log(`   ❌ Errores: ${errores}`);
        console.log(`   📦 Total procesados: ${productos.length}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error en la transacción:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar
agregarProductos();
