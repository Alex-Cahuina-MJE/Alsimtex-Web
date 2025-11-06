const pool = require('../db/database');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (solo admin)
const getAllUsuarios = async (req, res) => {
    try {
        const { rol, search } = req.query;
        
        let query = 'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (rol) {
            query += ` AND rol = $${paramCount}`;
            params.push(rol);
            paramCount++;
        }

        if (search) {
            query += ` AND (nombre ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ' ORDER BY id ASC';

        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            count: result.rows.length,
            usuarios: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Usuario no encontrado' 
            });
        }

        res.json({
            success: true,
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Crear nuevo usuario (solo admin)
const createUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Validaciones
        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Nombre, email y password son obligatorios' 
            });
        }

        // Verificar si el email ya existe
        const existingUser = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: 'El email ya está registrado' 
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO usuarios (nombre, email, password, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, email, rol, created_at`,
            [nombre, email, hashedPassword, rol || 'user']
        );

        console.log('✅ Usuario creado:', result.rows[0].email);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Actualizar usuario (solo admin)
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol, password } = req.body;

        // Verificar que el usuario existe
        const checkUser = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1',
            [id]
        );

        if (checkUser.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Usuario no encontrado' 
            });
        }

        // Si se proporciona un nuevo email, verificar que no exista
        if (email && email !== checkUser.rows[0].email) {
            const existingEmail = await pool.query(
                'SELECT * FROM usuarios WHERE email = $1 AND id != $2',
                [email, id]
            );

            if (existingEmail.rows.length > 0) {
                return res.status(400).json({ 
                    success: false,
                    error: 'El email ya está en uso' 
                });
            }
        }

        let query = 'UPDATE usuarios SET ';
        const params = [];
        let paramCount = 1;
        const updates = [];

        if (nombre) {
            updates.push(`nombre = $${paramCount}`);
            params.push(nombre);
            paramCount++;
        }

        if (email) {
            updates.push(`email = $${paramCount}`);
            params.push(email);
            paramCount++;
        }

        if (rol) {
            updates.push(`rol = $${paramCount}`);
            params.push(rol);
            paramCount++;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updates.push(`password = $${paramCount}`);
            params.push(hashedPassword);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'No hay campos para actualizar' 
            });
        }

        query += updates.join(', ');
        query += ` WHERE id = $${paramCount} RETURNING id, nombre, email, rol, created_at`;
        params.push(id);

        const result = await pool.query(query, params);

        console.log('✅ Usuario actualizado:', result.rows[0].email);

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Eliminar usuario (solo admin)
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // No permitir que el admin se elimine a sí mismo
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({ 
                success: false,
                error: 'No puedes eliminar tu propia cuenta' 
            });
        }

        const result = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Usuario no encontrado' 
            });
        }

        console.log('✅ Usuario eliminado:', result.rows[0].email);

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Cambiar rol de usuario
const cambiarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        if (!rol || !['user', 'admin'].includes(rol)) {
            return res.status(400).json({ 
                success: false,
                error: 'Rol inválido. Debe ser "user" o "admin"' 
            });
        }

        // No permitir que el admin cambie su propio rol
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({ 
                success: false,
                error: 'No puedes cambiar tu propio rol' 
            });
        }

        const result = await pool.query(
            'UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, email, rol',
            [rol, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Usuario no encontrado' 
            });
        }

        console.log('✅ Rol cambiado:', result.rows[0].email, '- Nuevo rol:', rol);

        res.json({
            success: true,
            message: 'Rol actualizado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error cambiando rol:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Obtener estadísticas de usuarios
const getEstadisticas = async (req, res) => {
    try {
        const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        const totalAdmins = await pool.query('SELECT COUNT(*) FROM usuarios WHERE rol = $1', ['admin']);
        const totalClientes = await pool.query('SELECT COUNT(*) FROM usuarios WHERE rol = $1', ['user']);

        res.json({
            success: true,
            estadisticas: {
                total: parseInt(totalUsuarios.rows[0].count),
                admins: parseInt(totalAdmins.rows[0].count),
                clientes: parseInt(totalClientes.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

module.exports = {
    getAllUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    cambiarRol,
    getEstadisticas
};
