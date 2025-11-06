const pool = require('./src/db/database');
const bcrypt = require('bcryptjs');

async function createUsers() {
    try {
        console.log('🔧 Creando tabla de usuarios...');
        
        // Crear tabla de usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                rol VARCHAR(20) DEFAULT 'cliente',
                telefono VARCHAR(20),
                direccion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabla de usuarios creada');

        // Hash de contraseñas
        const adminPassword = await bcrypt.hash('admin123', 10);
        const clientePassword = await bcrypt.hash('cliente123', 10);

        // Insertar usuario administrador
        try {
            await pool.query(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
                ['Administrador ALSIMTEX', 'admin@alsimtex.com', adminPassword, 'admin']
            );
            console.log('✅ Usuario admin creado: admin@alsimtex.com / admin123');
        } catch (error) {
            if (error.code === '23505') {
                console.log('⚠️  Usuario admin ya existe');
            } else {
                throw error;
            }
        }

        // Insertar usuario cliente de prueba
        try {
            await pool.query(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
                ['Juan Pérez', 'cliente@example.com', clientePassword, 'cliente']
            );
            console.log('✅ Usuario cliente creado: cliente@example.com / cliente123');
        } catch (error) {
            if (error.code === '23505') {
                console.log('⚠️  Usuario cliente ya existe');
            } else {
                throw error;
            }
        }

        // Mostrar todos los usuarios
        const result = await pool.query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id');
        console.log('\n📋 Usuarios en la base de datos:');
        console.table(result.rows);

        console.log('\n✅ Setup completado exitosamente');
        console.log('\n🔑 Credenciales de acceso:');
        console.log('   Admin:   admin@alsimtex.com / admin123');
        console.log('   Cliente: cliente@example.com / cliente123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en setup:', error);
        process.exit(1);
    }
}

createUsers();
