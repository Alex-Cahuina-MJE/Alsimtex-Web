require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432
});

async function createAdmin() {
    try {
        // Credenciales del administrador
        const adminData = {
            nombre: 'Administrador Principal',
            email: 'admin@alsimtex.com',
            password: 'Admin2023!', // Contraseña que usará el administrador
            rol: 'admin'
        };

        // Generar hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Actualizar o insertar el administrador
        const query = `
            INSERT INTO usuarios (nombre, email, password, rol)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) 
            DO UPDATE SET
                nombre = EXCLUDED.nombre,
                password = EXCLUDED.password,
                rol = EXCLUDED.rol
            RETURNING id, nombre, email, rol;
        `;

        const result = await pool.query(query, [
            adminData.nombre,
            adminData.email,
            hashedPassword,
            adminData.rol
        ]);

        console.log('Administrador creado/actualizado exitosamente:');
        console.log('Email:', adminData.email);
        console.log('Contraseña:', adminData.password);
        console.log('Por favor, guarde estas credenciales en un lugar seguro.');

    } catch (error) {
        console.error('Error al crear el administrador:', error);
    } finally {
        await pool.end();
    }
}

createAdmin();