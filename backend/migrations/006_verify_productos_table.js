const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const verifyTable = async() => {
    try {
        // 1. Obtener la estructura actual de la tabla
        console.log('Verificando estructura de la tabla productos...');
        const tableInfo = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'productos';
        `);

        console.log('Columnas actuales:', tableInfo.rows.map(row => row.column_name));

        // 2. Verificar si existen las columnas obsoletas
        const obsoleteColumns = ['requiere_medidas', 'medidas_disponibles', 'precios_por_medida'];
        const existingObsoleteColumns = tableInfo.rows
            .filter(row => obsoleteColumns.includes(row.column_name))
            .map(row => row.column_name);

        if (existingObsoleteColumns.length > 0) {
            console.log('⚠️ Se encontraron columnas obsoletas:', existingObsoleteColumns);

            // 3. Eliminar las columnas obsoletas si existen
            await pool.query('BEGIN');

            for (const column of existingObsoleteColumns) {
                console.log(`Eliminando columna ${column}...`);
                await pool.query(`
                    ALTER TABLE productos 
                    DROP COLUMN IF EXISTS ${column};
                `);
            }

            await pool.query('COMMIT');
            console.log('✅ Columnas obsoletas eliminadas correctamente');
        } else {
            console.log('✅ No se encontraron columnas obsoletas');
        }

        // 4. Verificar columnas requeridas
        const requiredColumns = [
            'id',
            'nombre',
            'descripcion',
            'precio_base',
            'categoria',
            'subcategoria',
            'imagenes',
            'imagen_principal',
            'stock',
            'estado',
            'descuento',
            'created_at',
            'updated_at'
        ];

        const missingColumns = requiredColumns.filter(col =>
            !tableInfo.rows.find(row => row.column_name === col)
        );

        if (missingColumns.length > 0) {
            console.log('⚠️ Faltan columnas requeridas:', missingColumns);
            throw new Error(`Faltan columnas requeridas: ${missingColumns.join(', ')}`);
        }

        console.log('✅ Estructura de la tabla verificada correctamente');

        // 5. Mostrar estructura final
        const finalStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'productos'
            ORDER BY ordinal_position;
        `);

        console.log('\nEstructura final de la tabla productos:');
        finalStructure.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type}`);
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error verificando la tabla:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

verifyTable()
    .then(() => console.log('Verificación completada'))
    .catch(error => {
        console.error('Error en la verificación:', error);
        process.exit(1);
    });