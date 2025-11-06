const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'BDalsimtex',
    port: 5432
});

const addDiscountColumnAndRemoveFields = async() => {
    try {
        // Iniciar transacción
        await pool.query('BEGIN');

        // Agregar columna de descuento si no existe
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'productos' 
                    AND column_name = 'descuento'
                ) THEN 
                    ALTER TABLE productos 
                    ADD COLUMN descuento NUMERIC(5,2) DEFAULT 0;
                END IF;
            END $$;
        `);

        // Eliminar columnas que ya no se necesitan solo si existen
        await pool.query(`
            DO $$ 
            BEGIN
                -- Verificar y eliminar requiere_medidas
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'productos' 
                    AND column_name = 'requiere_medidas'
                ) THEN 
                    ALTER TABLE productos DROP COLUMN requiere_medidas;
                END IF;

                -- Verificar y eliminar medidas_disponibles
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'productos' 
                    AND column_name = 'medidas_disponibles'
                ) THEN 
                    ALTER TABLE productos DROP COLUMN medidas_disponibles;
                END IF;

                -- Verificar y eliminar precios_por_medida
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'productos' 
                    AND column_name = 'precios_por_medida'
                ) THEN 
                    ALTER TABLE productos DROP COLUMN precios_por_medida;
                END IF;
            END $$;
        `);

        // Confirmar transacción
        await pool.query('COMMIT');

        console.log('✅ Migración completada exitosamente');
    } catch (error) {
        // Revertir cambios en caso de error
        await pool.query('ROLLBACK');
        console.error('❌ Error en la migración:', error);
        throw error;
    } finally {
        // Cerrar la conexión
        await pool.end();
    }
};

// Ejecutar la migración
addDiscountColumnAndRemoveFields()
    .then(() => console.log('Migración finalizada'))
    .catch(error => {
        console.error('Error ejecutando la migración:', error);
        process.exit(1);
    });