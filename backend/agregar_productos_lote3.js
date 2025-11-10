const pool = require('./src/db/database');

// URL de imagen por defecto
const IMAGEN_DEFAULT = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

// Productos a agregar (010101 - 010206)
const productos = [
    // PROTECTORES BP+ANTIFLUIDO (continuación)
    { nombre: "PROTECTOR BP+ANTIFLUIDO QUEEN", descripcion: "PROTECTOR BP+ANTIFLUIDO QUEEN", categoria: "PROTECTORES", subcategoria: "BP+ANTIFLUIDO", tamano: "QUEEN" },
    { nombre: "PROTECTOR BP+ANTIFLUIDO KING", descripcion: "PROTECTOR BP+ANTIFLUIDO KING", categoria: "PROTECTORES", subcategoria: "BP+ANTIFLUIDO", tamano: "KING" },
    // PROTECTORES CHINO+ANTIFLUIDO
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO 1.5P", descripcion: "PROTECTOR CHINO+ANTIFLUIDO 1.5P", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "1 1/2 PLAZA" },
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO 2P", descripcion: "PROTECTOR CHINO+ANTIFLUIDO 2P", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "2 PLAZAS" },
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO QUEEN", descripcion: "PROTECTOR CHINO+ANTIFLUIDO QUEEN", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "QUEEN" },
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO KING", descripcion: "PROTECTOR CHINO+ANTIFLUIDO KING", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "KING" },
    // PROTECTORES SEMI MALETA BP+ANTIFLUIDO
    { nombre: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO 1.5P", descripcion: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO 1.5P", categoria: "PROTECTORES", subcategoria: "SEMI MALETA BP+A", tamano: "1 1/2 PLAZA" },
    { nombre: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO 2P", descripcion: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO 2P", categoria: "PROTECTORES", subcategoria: "SEMI MALETA BP+A", tamano: "2 PLAZAS" },
    { nombre: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO QUEEN", descripcion: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO QUEEN", categoria: "PROTECTORES", subcategoria: "SEMI MALETA BP+A", tamano: "QUEEN" },
    { nombre: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO KING", descripcion: "PROTECTOR SEMI MALETA BP+ANTIFLUIDO KING", categoria: "PROTECTORES", subcategoria: "SEMI MALETA BP+A", tamano: "KING" },
    // PROTECTORES SEMI MALETA CHINO+ANTIFLUIDO
    { nombre: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO 1.5P", descripcion: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO 1.5P", categoria: "PROTECTORES", subcategoria: "SEMI MALETA CHINO+A", tamano: "1 1/2 PLAZA" },
    { nombre: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO 2P", descripcion: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO 2P", categoria: "PROTECTORES", subcategoria: "SEMI MALETA CHINO+A", tamano: "2 PLAZAS" },
    { nombre: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO QUEEN", descripcion: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO QUEEN", categoria: "PROTECTORES", subcategoria: "SEMI MALETA CHINO+A", tamano: "QUEEN" },
    { nombre: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO KING", descripcion: "PROTECTOR SEMI MALETA CHINO 80GR+ANTIFLUIDO KING", categoria: "PROTECTORES", subcategoria: "SEMI MALETA CHINO+A", tamano: "KING" },
    // PROTECTORES CHINO+ANTIFLUIDO (duplicados con diferente código)
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO 1.5P", descripcion: "PROTECTOR CHINO+ANTIFLUIDO 1.5P", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "1 1/2 PLAZA" },
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO 2P", descripcion: "PROTECTOR CHINO+ANTIFLUIDO 2P", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "2 PLAZAS" },
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO QUEEN", descripcion: "PROTECTOR CHINO+ANTIFLUIDO QUEEN", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "QUEEN" },
    { nombre: "PROTECTOR CHINO+ANTIFLUIDO KING", descripcion: "PROTECTOR CHINO+ANTIFLUIDO KING", categoria: "PROTECTORES", subcategoria: "CHINO+ANTIFLUIDO", tamano: "KING" },
    // FUNDAS DE COLCHON CHINO+ANTIFLUIDO
    { nombre: "FUNDA DE COLCHON CHINO+ANTIFLUIDO CON CIERRE 1.5P", descripcion: "FUNDA DE COLCHON CHINO+ANTIFLUIDO CON CIERRE 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO+ANTIFLUIDO", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON CHINO+ANTIFLUIDO CON CIERRE 2P", descripcion: "FUNDA DE COLCHON CHINO+ANTIFLUIDO CON CIERRE 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO+ANTIFLUIDO", tamano: "2 PLAZAS" },
    // FUNDAS DE COLCHON PK
    { nombre: "FUNDA DE COLCHON PK 18CM 1.5P", descripcion: "FUNDA DE COLCHON PK 18CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON PK 20CM 1.5P", descripcion: "FUNDA DE COLCHON PK 20CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON PK 25CM 1.5P", descripcion: "FUNDA DE COLCHON PK 25CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON PK 30CM 1.5P", descripcion: "FUNDA DE COLCHON PK 30CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON PK 35CM 1.5P", descripcion: "FUNDA DE COLCHON PK 35CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON PK 18CM 2P", descripcion: "FUNDA DE COLCHON PK 18CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON PK 20CM 2P", descripcion: "FUNDA DE COLCHON PK 20CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON PK 25CM 2P", descripcion: "FUNDA DE COLCHON PK 25CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON PK 30CM 2P", descripcion: "FUNDA DE COLCHON PK 30CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON PK 35CM 2P", descripcion: "FUNDA DE COLCHON PK 35CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON PK 40CM 2P", descripcion: "FUNDA DE COLCHON PK 40CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON PK 30CM QUEEN", descripcion: "FUNDA DE COLCHON PK 30CM QUEEN", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "QUEEN" },
    { nombre: "FUNDA DE COLCHON PK 40CM QUEEN", descripcion: "FUNDA DE COLCHON PK 40CM QUEEN", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "QUEEN" },
    { nombre: "FUNDA DE COLCHON PK 30CM KING", descripcion: "FUNDA DE COLCHON PK 30CM KING", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "KING" },
    { nombre: "FUNDA DE COLCHON PK 40CM KING", descripcion: "FUNDA DE COLCHON PK 40CM KING", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: "KING" },
    // FUNDAS DE COLCHON CHINO
    { nombre: "FUNDA DE COLCHON CHINO 20CM 1.5P", descripcion: "FUNDA DE COLCHON CHINO 20CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON CHINO 25CM 1.5P", descripcion: "FUNDA DE COLCHON CHINO 25CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON CHINO 30CM 1.5P", descripcion: "FUNDA DE COLCHON CHINO 30CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON CHINO 20CM 2P", descripcion: "FUNDA DE COLCHON CHINO 20CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON CHINO 25CM 2P", descripcion: "FUNDA DE COLCHON CHINO 25CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON CHINO 30CM 2P", descripcion: "FUNDA DE COLCHON CHINO 30CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "CHINO", tamano: "2 PLAZAS" },
    // FUNDAS DE COLCHON BP
    { nombre: "FUNDA DE COLCHON  BP 20CM 1.5P", descripcion: "FUNDA DE COLCHON  BP 20CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON  BP 25CM 1.5P", descripcion: "FUNDA DE COLCHON  BP 25CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON  BP 30CM 1.5P", descripcion: "FUNDA DE COLCHON  BP 30CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON  BP 35CM 1.5P", descripcion: "FUNDA DE COLCHON  BP 35CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON  BP 40CM 1.5P", descripcion: "FUNDA DE COLCHON  BP 40CM 1.5P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "1 1/2 PLAZA" },
    { nombre: "FUNDA DE COLCHON  BP 20CM 2P", descripcion: "FUNDA DE COLCHON  BP 20CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON  BP 25CM 2P", descripcion: "FUNDA DE COLCHON  BP 25CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON  BP 30CM 2P", descripcion: "FUNDA DE COLCHON  BP 30CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON  BP 35CM 2P", descripcion: "FUNDA DE COLCHON  BP 35CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON  BP 40CM 2P", descripcion: "FUNDA DE COLCHON  BP 40CM 2P", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "2 PLAZAS" },
    { nombre: "FUNDA DE COLCHON  BP 25CM QUEEN", descripcion: "FUNDA DE COLCHON  BP 25CM QUEEN", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "QUEEN" },
    { nombre: "FUNDA DE COLCHON  BP 30CM QUEEN", descripcion: "FUNDA DE COLCHON  BP 30CM QUEEN", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "QUEEN" },
    { nombre: "FUNDA DE COLCHON  BP 40CM QUEEN", descripcion: "FUNDA DE COLCHON  BP 40CM QUEEN", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "QUEEN" },
    { nombre: "FUNDA DE COLCHON  BP 30CM KING", descripcion: "FUNDA DE COLCHON  BP 30CM KING", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "KING" },
    { nombre: "FUNDA DE COLCHON  BP 40CM KING", descripcion: "FUNDA DE COLCHON  BP 40CM KING", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "KING" },
    { nombre: "FUNDA DE COLCHON  BP 45CM KING", descripcion: "FUNDA DE COLCHON  BP 45CM KING", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: "KING" },
    // FRAZADAS
    { nombre: "FRAZADA COLOMBIANA 1.5P", descripcion: "FRAZADA COLOMBIANA 1.5P", categoria: "FRAZADAS", subcategoria: "COLOMBIANA", tamano: "1 1/2 PLAZA" },
    { nombre: "FRAZADA COLOMBIANA 2P", descripcion: "FRAZADA COLOMBIANA 2P", categoria: "FRAZADAS", subcategoria: "COLOMBIANA", tamano: "2 PLAZAS" },
    { nombre: "FRAZADA COLOMBIANA QUEEN", descripcion: "FRAZADA COLOMBIANA QUEEN", categoria: "FRAZADAS", subcategoria: "COLOMBIANA", tamano: "QUEEN" },
    { nombre: "FRAZADA COLOMBIANA KING", descripcion: "FRAZADA COLOMBIANA KING", categoria: "FRAZADAS", subcategoria: "COLOMBIANA", tamano: "KING" },
    // DUVET
    { nombre: "DUVET BP 1.5P", descripcion: "DUVET BP 1.5P", categoria: "DUVET", subcategoria: "BP", tamano: "1 1/2 PLAZA" },
    { nombre: "DUVET BP 2P", descripcion: "DUVET BP 2P", categoria: "DUVET", subcategoria: "BP", tamano: "2 PLAZAS" },
    { nombre: "DUVET BP QUEEN", descripcion: "DUVET BP QUEEN", categoria: "DUVET", subcategoria: "BP", tamano: "QUEEN" },
    { nombre: "DUVET BP KING", descripcion: "DUVET BP KING", categoria: "DUVET", subcategoria: "BP", tamano: "KING" },
    { nombre: "DUVET PK 1.5P", descripcion: "DUVET PK 1.5P", categoria: "DUVET", subcategoria: "PK", tamano: "1 1/2 PLAZA" },
    { nombre: "DUVET PK 2P", descripcion: "DUVET PK 2P", categoria: "DUVET", subcategoria: "PK", tamano: "2 PLAZAS" },
    { nombre: "DUVET PK QUEEN", descripcion: "DUVET PK QUEEN", categoria: "DUVET", subcategoria: "PK", tamano: "QUEEN" },
    { nombre: "DUVET PK KING", descripcion: "DUVET PK KING", categoria: "DUVET", subcategoria: "PK", tamano: "KING" },
    // SERVICIOS Y PRODUCTOS VARIOS
    { nombre: "SERVICIOS VARIOS", descripcion: "SERVICIOS VARIOS", categoria: "SERVICIOS", subcategoria: "VARIOS", tamano: null },
    { nombre: "PRODUCTOS VARIOS", descripcion: "PRODUCTOS VARIOS", categoria: "PRODUCTOS", subcategoria: "VARIOS", tamano: null },
    // RESPALDOS Y ALMOHADAS
    { nombre: "RESPALDO, ANATOMICO", descripcion: "RESPALDO ANATOMICO", categoria: "RESPALDOS", subcategoria: "ANATOMICO", tamano: null },
    { nombre: "ALMOHADA", descripcion: "ALMOHADA", categoria: "ALMOHADAS", subcategoria: "ESTANDAR", tamano: null },
    { nombre: "CUELLERA", descripcion: "CUELLERA", categoria: "ALMOHADAS", subcategoria: "CUELLERA", tamano: null },
    { nombre: "HUESO", descripcion: "HUESO", categoria: "ALMOHADAS", subcategoria: "HUESO", tamano: null },
    { nombre: "FUNDAS PARA ALMOHADA", descripcion: "FUNDAS PARA ALMOHADA", categoria: "FUNDAS DE COLCHON", subcategoria: "ALMOHADA", tamano: null },
    // NAPA
    { nombre: "BOLSA DE NAPA 5 KG", descripcion: "BOLSA DE NAPA 5 KG", categoria: "PRODUCTOS", subcategoria: "NAPA", tamano: null },
    { nombre: "NAPA 1 KG", descripcion: "NAPA 1 KG", categoria: "PRODUCTOS", subcategoria: "NAPA", tamano: null },
    { nombre: "NAPA VIRGEN 1K", descripcion: "NAPA VIRGEN 1K", categoria: "PRODUCTOS", subcategoria: "NAPA", tamano: null },
    { nombre: "BOLSA DE NAPA VIRGEN 5K", descripcion: "BOLSA DE NAPA VIRGEN 5K", categoria: "PRODUCTOS", subcategoria: "NAPA", tamano: null },
    // ALMOHADAS ESPECÍFICAS
    { nombre: "ALMOHADA CHICA", descripcion: "ALMOHADA CHICA", categoria: "ALMOHADAS", subcategoria: "TAMAÑOS", tamano: null },
    { nombre: "ALMOHADA MEDIANA", descripcion: "ALMOHADA MEDIANA", categoria: "ALMOHADAS", subcategoria: "TAMAÑOS", tamano: null },
    { nombre: "ALMOHADA JUMBO", descripcion: "ALMOHADA JUMBO", categoria: "ALMOHADAS", subcategoria: "TAMAÑOS", tamano: null },
    { nombre: "ALMOHADA BAMBU", descripcion: "ALMOHADA BAMBU", categoria: "ALMOHADAS", subcategoria: "BAMBU", tamano: null },
    { nombre: "ALMOHADA KING JUMBO", descripcion: "ALMOHADA KING JUMBO", categoria: "ALMOHADAS", subcategoria: "TAMAÑOS", tamano: "KING" },
    // CATEGORÍAS GENERALES
    { nombre: "SABANAS", descripcion: "SABANAS", categoria: "SABANAS", subcategoria: "GENERAL", tamano: null },
    { nombre: "COBERTORES", descripcion: "COBERTORES", categoria: "COBERTORES", subcategoria: "GENERAL", tamano: null },
    { nombre: "EDREDRONES", descripcion: "EDREDRONES", categoria: "EDREDRONES", subcategoria: "GENERAL", tamano: null },
    { nombre: "PROTECTORES", descripcion: "PROTECTORES", categoria: "PROTECTORES", subcategoria: "GENERAL", tamano: null },
    { nombre: "FUNDAS DE COLCHON PK", descripcion: "FUNDAS DE COLCHON PK", categoria: "FUNDAS DE COLCHON", subcategoria: "PK", tamano: null },
    { nombre: "FRAZADAS", descripcion: "FRAZADAS", categoria: "FRAZADAS", subcategoria: "GENERAL", tamano: null },
    { nombre: "DUVET", descripcion: "DUVET", categoria: "DUVET", subcategoria: "GENERAL", tamano: null },
    // COBERTORES ESPECÍFICOS
    { nombre: "COBERTOR 1.5P BP", descripcion: "COBERTOR 1.5P BP", categoria: "COBERTORES", subcategoria: "BP", tamano: "1 1/2 PLAZA" },
    { nombre: "COBERTOR 2P BP", descripcion: "COBERTOR 2P BP", categoria: "COBERTORES", subcategoria: "BP", tamano: "2 PLAZAS" },
    { nombre: "COBERTOR 3P KING BP", descripcion: "COBERTOR 3P KING BP", categoria: "COBERTORES", subcategoria: "BP", tamano: "KING" },
    // FUNDAS DE COLCHON GENERALES
    { nombre: "FUNDAS DE COLCHON ECONOMICAS", descripcion: "FUNDAS DE COLCHON ECONOMICAS", categoria: "FUNDAS DE COLCHON", subcategoria: "ECONOMICAS", tamano: null },
    { nombre: "FUNDAS DE COLCHON BP", descripcion: "FUNDA DE COLCHON BP", categoria: "FUNDAS DE COLCHON", subcategoria: "BP", tamano: null },
    // JUEGOS
    { nombre: "JUEGOS COB 2P PK+PK 2.1 M", descripcion: "JUEGOS COB 2P PK+PK 2.1 M", categoria: "JUEGOS", subcategoria: "PK+PK", tamano: null },
    { nombre: "JUEGOS COB 2P PK+PK 1.7M", descripcion: "JUEGOS COB 2P PK+PK 1.7M", categoria: "JUEGOS", subcategoria: "PK+PK", tamano: null },
    { nombre: "JUEGOS COB 2P PK + CARNERO 1.7M", descripcion: "JUEGOS COB 2P PK + CARNERO 1.7M", categoria: "JUEGOS", subcategoria: "PK+CARNERO", tamano: null },
    { nombre: "JUEGOS COB QUEEN PK+PK 2.6M", descripcion: "JUEGOS COB QUEEN PK+PK 2.6M", categoria: "JUEGOS", subcategoria: "PK+PK", tamano: "QUEEN" },
    { nombre: "JUEGOS COB PK QUEEN 2.6 TL+TL CARNERO", descripcion: "JUEGOS COB PK QUEEN 2.6 TL+TL CARNERO", categoria: "JUEGOS", subcategoria: "PK+CARNERO", tamano: "QUEEN" },
    { nombre: "JUEGOS COB KING PK+PK", descripcion: "JUEGOS COB KING PK+PK", categoria: "JUEGOS", subcategoria: "PK+PK", tamano: "KING" },
    { nombre: "JUEGOS COB PK TL+TL CARNERO KING", descripcion: "JUEGOS COB PK TL+TL CARNERO KING", categoria: "JUEGOS", subcategoria: "PK+CARNERO", tamano: "KING" },
    { nombre: "JUEGOS COB 2P PK+CARNERO QUEEN", descripcion: "JUEGOS COB 2P PK+CARNERO QUEEN", categoria: "JUEGOS", subcategoria: "PK+CARNERO", tamano: "QUEEN" },
    // CUNAS
    { nombre: "CUNAS", descripcion: "CUNAS", categoria: "PRODUCTOS", subcategoria: "CUNAS", tamano: null }
];

async function agregarProductos() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🚀 Iniciando inserción de productos (Lote 3: 010101-010206)...\n');
        
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
                     imagenes, imagen_principal, stock, estado, descuento, tamano)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
                        0, // descuento
                        producto.tamano // tamano
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
