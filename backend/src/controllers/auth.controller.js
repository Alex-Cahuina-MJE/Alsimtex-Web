const pool = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// Registro de usuario
const register = async(req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        logger.info('Intentando registrar usuario:', { nombre, email });

        // Verificar si el usuario ya existe
        const userExists = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1', [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario
        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *', [nombre, email, hashedPassword, rol || 'user']
        );

        // Crear token
        const token = jwt.sign({ id: newUser.rows[0].id, rol: newUser.rows[0].rol },
            process.env.JWT_SECRET
        );

        logger.info('Usuario registrado exitosamente:', newUser.rows[0].email);

        res.json({
            user: {
                id: newUser.rows[0].id,
                nombre: newUser.rows[0].nombre,
                email: newUser.rows[0].email,
                rol: newUser.rows[0].rol
            },
            token
        });
    } catch (error) {
        logger.error('Error en register:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login de usuario
const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        logger.info('Intentando login para:', email);

        // Verificar si el usuario existe
        const user = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1', [email]
        );

        if (user.rows.length === 0) {
            logger.warn('Usuario no encontrado:', email);
            return res.status(404).json({ error: 'El usuario con este email no existe. Por favor, regístrese.' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            logger.warn('Contraseña incorrecta para:', email);
            return res.status(400).json({ error: 'Email o contraseña incorrectos' });
        }

        // Crear token
        const token = jwt.sign({ id: user.rows[0].id, rol: user.rows[0].rol },
            process.env.JWT_SECRET
        );

        logger.info('Login exitoso para:', email);

        res.json({
            user: {
                id: user.rows[0].id,
                nombre: user.rows[0].nombre,
                email: user.rows[0].email,
                rol: user.rows[0].rol
            },
            token
        });
    } catch (error) {
        logger.error('Error en login:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener perfil de usuario
const getProfile = async(req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile
};