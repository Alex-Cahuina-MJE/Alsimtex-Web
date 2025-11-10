const pool = require('./src/db/database');

// URL de imagen por defecto
const IMAGEN_DEFAULT = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

// Productos a agregar (010041 - 010100)
const productos = [
    // COBERTORES BP+CARNERO (continuación)
    {
        nombre: "COBERTOR BP+CARNERO QUEEN ANCHO 2.6",
        descripcion: "COBERTOR BP+CARNERO QUEEN ANCHO 2.6",
        categoria: "COBERTORES",
        subcategoria: "BP+CARNERO",
        modelo: "QUEEN"
    },
    {
        nombre: "COBERTOR BP+CARNERO KING ANCHO 2.9",
        descripcion: "COBERTOR BP+CARNERO KING ANCHO 2.9",
        categoria: "COBERTORES",
        subcategoria: "BP+CARNERO",
        modelo: "KING"
    },
    // COBERTORES PK
    {
        nombre: "COBERTOR PK 1.5P ANCHO 1.7",
        descripcion: "COBERTOR PK 1.5P ANCHO 1.7",
        categoria: "COBERTORES",
        subcategoria: "PK",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR PK 1.5P ANCHO 1.9",
        descripcion: "COBERTOR PK 1.5P ANCHO 1.9",
        categoria: "COBERTORES",
        subcategoria: "PK",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR PK 2P ANCHO 2.1",
        descripcion: "COBERTOR PK 2P ANCHO 2.1",
        categoria: "COBERTORES",
        subcategoria: "PK",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR PK 2P ANCHO 2.3",
        descripcion: "COBERTOR PK 2P ANCHO 2.3",
        categoria: "COBERTORES",
        subcategoria: "PK",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR PK QUEEN ANCHO 2.6",
        descripcion: "COBERTOR PK QUEEN ANCHO 2.6",
        categoria: "COBERTORES",
        subcategoria: "PK",
        modelo: "QUEEN"
    },
    {
        nombre: "COBERTOR PK KING ANCHO 2.9",
        descripcion: "COBERTOR PK KING ANCHO 2.9",
        categoria: "COBERTORES",
        subcategoria: "PK",
        modelo: "KING"
    },
    // COBERTORES PK+CARNERO
    {
        nombre: "COBERTOR PK+CARNERO 1.5P ANCHO 1.7",
        descripcion: "COBERTOR PK+CARNERO 1.5P ANCHO 1.7",
        categoria: "COBERTORES",
        subcategoria: "PK+CARNERO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR PK+CARNERO 1.5P ANCHO 1.9",
        descripcion: "COBERTOR PK+CARNERO 1.5P ANCHO 1.9",
        categoria: "COBERTORES",
        subcategoria: "PK+CARNERO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR PK+CARNERO 2P ANCHO 2.1",
        descripcion: "COBERTOR PK+CARNERO 2P ANCHO 2.1",
        categoria: "COBERTORES",
        subcategoria: "PK+CARNERO",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR PK+CARNERO 2P ANCHO 2.3",
        descripcion: "COBERTOR PK+CARNERO 2P ANCHO 2.3",
        categoria: "COBERTORES",
        subcategoria: "PK+CARNERO",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR PK+CARNERO QUEEN ANCHO 2.6",
        descripcion: "COBERTOR PK+CARNERO QUEEN ANCHO 2.6",
        categoria: "COBERTORES",
        subcategoria: "PK+CARNERO",
        modelo: "QUEEN"
    },
    {
        nombre: "COBERTOR PK+CARNERO KING ANCHO 2.9",
        descripcion: "COBERTOR PK+CARNERO KING ANCHO 2.9",
        categoria: "COBERTORES",
        subcategoria: "PK+CARNERO",
        modelo: "KING"
    },
    // COBERTOR PK+POLAR
    {
        nombre: "COBERTOR PK+POLAR 1.5P ANCHO 1.7",
        descripcion: "COBERTOR PK+POLAR 1.5P ANCHO 1.7",
        categoria: "COBERTORES",
        subcategoria: "PK+POLAR",
        modelo: "1 1/2 PLAZA"
    },
    // COBERTORES BP AVALON
    {
        nombre: "COBERTOR BP 1.5P AVALON DOBLE FIBRA",
        descripcion: "COBERTOR BP 1.5P AVALON DOBLE FIBRA",
        categoria: "COBERTORES",
        subcategoria: "BP AVALON",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR BP 2P AVALON DOBLE FIBRA",
        descripcion: "COBERTOR BP 2P AVALON DOBLE FIBRA",
        categoria: "COBERTORES",
        subcategoria: "BP AVALON",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR BP QUEEN AVALON DOBLE FIBRA",
        descripcion: "COBERTOR BP QUEEN AVALON DOBLE FIBRA",
        categoria: "COBERTORES",
        subcategoria: "BP AVALON",
        modelo: "QUEEN"
    },
    {
        nombre: "COBERTOR BP KING AVALON DOBLE FIBRA",
        descripcion: "COBERTOR BP KING AVALON DOBLE FIBRA",
        categoria: "COBERTORES",
        subcategoria: "BP AVALON",
        modelo: "KING"
    },
    // COBERTORES SAN JACINTO
    {
        nombre: "COBERTOR SAN JACINTO 1.5P 180H 1.9 ANCHO",
        descripcion: "COBERTOR SAN JACINTO 1.5P 180H 1.9 ANCHO",
        categoria: "COBERTORES",
        subcategoria: "SAN JACINTO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "COBERTOR SAN JACINTO 2P 180H 2.3 ANCHO",
        descripcion: "COBERTOR SAN JACINTO 2P 180H 2.3 ANCHO",
        categoria: "COBERTORES",
        subcategoria: "SAN JACINTO",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "COBERTOR SAN JACINTO QUEEN 180H 2.6 ANCHO",
        descripcion: "COBERTOR SAN JACINTO QUEEN 180H 2.6 ANCHO",
        categoria: "COBERTORES",
        subcategoria: "SAN JACINTO",
        modelo: "QUEEN"
    },
    {
        nombre: "COBERTOR SAN JACINTO 180H 2.9 ANCHO KING",
        descripcion: "COBERTOR SAN JACINTO 180H 2.9 ANCHO KING",
        categoria: "COBERTORES",
        subcategoria: "SAN JACINTO",
        modelo: "KING"
    },
    // EDREDONES BP
    {
        nombre: "EDREDON BP 1.5P",
        descripcion: "EDREDON BP 1.5P",
        categoria: "EDREDRONES",
        subcategoria: "BP",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "EDREDON BP 2P",
        descripcion: "EDREDON BP 2P",
        categoria: "EDREDRONES",
        subcategoria: "BP",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "EDREDON BP QUEEN",
        descripcion: "EDREDON BP QUEEN",
        categoria: "EDREDRONES",
        subcategoria: "BP",
        modelo: "QUEEN"
    },
    {
        nombre: "EDREDON BP KING",
        descripcion: "EDREDON BP KING",
        categoria: "EDREDRONES",
        subcategoria: "BP",
        modelo: "KING"
    },
    // EDREDONES PK
    {
        nombre: "EDREDON PK 1.5P",
        descripcion: "EDREDON PK 1.5P",
        categoria: "EDREDRONES",
        subcategoria: "PK",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "EDREDON PK 2P",
        descripcion: "EDREDON PK 2P",
        categoria: "EDREDRONES",
        subcategoria: "PK",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "EDREDON PK QUEEN",
        descripcion: "EDREDON PK QUEEN",
        categoria: "EDREDRONES",
        subcategoria: "PK",
        modelo: "QUEEN"
    },
    {
        nombre: "EDREDON PK KING",
        descripcion: "EDREDON PK KING",
        categoria: "EDREDRONES",
        subcategoria: "PK",
        modelo: "KING"
    },
    // EDREDONES YAKAR
    {
        nombre: "EDREDON YAKAR 1.5P",
        descripcion: "EDREDON YAKAR 1.5P",
        categoria: "EDREDRONES",
        subcategoria: "YAKAR",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "EDREDON YAKAR 2P",
        descripcion: "EDREDON YAKAR 2P",
        categoria: "EDREDRONES",
        subcategoria: "YAKAR",
        modelo: "2 PLAZAS"
    },
    // EDREDONES POLAR
    {
        nombre: "EDREDON POLAR 1.5P",
        descripcion: "EDREDON POLAR 1.5P",
        categoria: "EDREDRONES",
        subcategoria: "POLAR",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "EDREDON POLAR 2P",
        descripcion: "EDREDON POLAR 2P",
        categoria: "EDREDRONES",
        subcategoria: "POLAR",
        modelo: "2 PLAZAS"
    },
    // EDREDONES CHINO
    {
        nombre: "EDREDON CHINO 80GR 1.5P",
        descripcion: "EDREDON CHINO 80GR 1.5P",
        categoria: "EDREDRONES",
        subcategoria: "CHINO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "EDREDON CHINO 80GR 2P",
        descripcion: "EDREDON CHINO 80GR 2P",
        categoria: "EDREDRONES",
        subcategoria: "CHINO",
        modelo: "2 PLAZAS"
    },
    // PROTECTORES BP
    {
        nombre: "PROTECTOR BP 1.5P",
        descripcion: "PROTECTOR BP 1.5P",
        categoria: "PROTECTORES",
        subcategoria: "BP",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "PROTECTOR BP 2P",
        descripcion: "PROTECTOR BP 2P",
        categoria: "PROTECTORES",
        subcategoria: "BP",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "PROTECTOR BP QUEEN",
        descripcion: "PROTECTOR BP QUEEN",
        categoria: "PROTECTORES",
        subcategoria: "BP",
        modelo: "QUEEN"
    },
    {
        nombre: "PROTECTOR BP KING",
        descripcion: "PROTECTOR BP KING",
        categoria: "PROTECTORES",
        subcategoria: "BP",
        modelo: "KING"
    },
    // PROTECTORES CHINO
    {
        nombre: "PROTECTOR CHINO 80GR 1.5P",
        descripcion: "PROTECTOR CHINO 80GR 1.5P",
        categoria: "PROTECTORES",
        subcategoria: "CHINO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "PROTECTOR CHINO 80GR BP 2P",
        descripcion: "PROTECTOR CHINO 80GR BP 2P",
        categoria: "PROTECTORES",
        subcategoria: "CHINO",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "PROTECTOR CHINO 80GR QUEEN",
        descripcion: "PROTECTOR CHINO 80GR QUEEN",
        categoria: "PROTECTORES",
        subcategoria: "CHINO",
        modelo: "QUEEN"
    },
    {
        nombre: "PROTECTOR CHINO 80GR KING",
        descripcion: "PROTECTOR CHINO 80GR KING",
        categoria: "PROTECTORES",
        subcategoria: "CHINO",
        modelo: "KING"
    },
    // PROTECTORES MALETA BP
    {
        nombre: "PROTECTOR MALETA BP 1.5P HOTELERO",
        descripcion: "PROTECTOR MALETA BP 1.5P HOTELERO",
        categoria: "PROTECTORES",
        subcategoria: "MALETA BP",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "PROTECTOR MALETA BP 2P HOTELERO",
        descripcion: "PROTECTOR MALETA BP 2P HOTELERO",
        categoria: "PROTECTORES",
        subcategoria: "MALETA BP",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "PROTECTOR MALETA BP QUEEN HOTELERO",
        descripcion: "PROTECTOR MALETA BP QUEEN HOTELERO",
        categoria: "PROTECTORES",
        subcategoria: "MALETA BP",
        modelo: "QUEEN"
    },
    {
        nombre: "PROTECTOR MALETA BP KING HOTELERO",
        descripcion: "PROTECTOR MALETA BP KING HOTELERO",
        categoria: "PROTECTORES",
        subcategoria: "MALETA BP",
        modelo: "KING"
    },
    // PROTECTORES SEMI MALETA BP
    {
        nombre: "PROTECTOR SEMI MALETA BP 1.5P",
        descripcion: "PROTECTOR SEMI MALETA BP 1.5P",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA BP",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "PROTECTOR SEMI MALETA BP 2P",
        descripcion: "PROTECTOR SEMI MALETA BP 2P",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA BP",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "PROTECTOR SEMI MALETA BP QUEEN",
        descripcion: "PROTECTOR SEMI MALETA BP QUEEN",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA BP",
        modelo: "QUEEN"
    },
    {
        nombre: "PROTECTOR SEMI MALETA BP KING",
        descripcion: "PROTECTOR SEMI MALETA BP KING",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA BP",
        modelo: "KING"
    },
    // PROTECTORES SEMI MALETA CHINO
    {
        nombre: "PROTECTOR SEMI MALETA CHINO 1.5P",
        descripcion: "PROTECTOR SEMI MALETA CHINO 1.5P",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA CHINO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "PROTECTOR SEMI MALETA CHINO 2P",
        descripcion: "PROTECTOR SEMI MALETA CHINO 2P",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA CHINO",
        modelo: "2 PLAZAS"
    },
    {
        nombre: "PROTECTOR SEMI MALETA CHINO QUEEN",
        descripcion: "PROTECTOR SEMI MALETA CHINO QUEEN",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA CHINO",
        modelo: "QUEEN"
    },
    {
        nombre: "PROTECTOR SEMI MALETA CHINO KING",
        descripcion: "PROTECTOR SEMI MALETA CHINO KING",
        categoria: "PROTECTORES",
        subcategoria: "SEMI MALETA CHINO",
        modelo: "KING"
    },
    // PROTECTOR SOLERA CHINO
    {
        nombre: "PROTECTOR SOLERA CHINO 80GR 1.5P",
        descripcion: "PROTECTOR SOLERA CHINO 80GR 1.5P",
        categoria: "PROTECTORES",
        subcategoria: "SOLERA CHINO",
        modelo: "1 1/2 PLAZA"
    },
    // PROTECTORES BP+ANTIFLUIDO
    {
        nombre: "PROTECTOR BP+ANTIFLUIDO 1.5P",
        descripcion: "PROTECTOR BP+ANTIFLUIDO 1.5P",
        categoria: "PROTECTORES",
        subcategoria: "BP+ANTIFLUIDO",
        modelo: "1 1/2 PLAZA"
    },
    {
        nombre: "PROTECTOR BP+ANTIFLUIDO 2P",
        descripcion: "PROTECTOR BP+ANTIFLUIDO 2P",
        categoria: "PROTECTORES",
        subcategoria: "BP+ANTIFLUIDO",
        modelo: "2 PLAZAS"
    }
];

async function agregarProductos() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🚀 Iniciando inserción de productos (Lote 2: 010041-010100)...\n');
        
        let insertados = 0;
        let errores = 0;
        let existentes = 0;
        
        for (const producto of productos) {
            try {
                // Verificar si el producto ya existe
                const existe = await client.query(
                    'SELECT id FROM productos WHERE nombre = $1',
                    [producto.nombre]
                );
                
                if (existe.rows.length > 0) {
                    existentes++;
                    console.log(`⚠️  Ya existe: ${producto.nombre} (ID: ${existe.rows[0].id})`);
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
        console.log(`   ⚠️  Ya existentes: ${existentes}`);
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
