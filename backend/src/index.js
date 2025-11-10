const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const productosRoutes = require('./routes/productos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const contactoRoutes = require('./routes/contacto.routes');
const configuracionRoutes = require('./routes/configuracion.routes');
const pool = require('./db/database');
const logger = require('./config/logger');
const { securityMiddleware, authLimiter } = require('./config/security');

// Cargar variables de entorno
dotenv.config();

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const app = express();

// Middleware de seguridad
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
securityMiddleware.forEach(middleware => app.use(middleware));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta raíz - bienvenida
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Alsimtex - Servidor funcionando correctamente',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            productos: '/api/productos',
            usuarios: '/api/usuarios',
            pedidos: '/api/pedidos',
            contacto: '/api/contacto',
            configuracion: '/api/configuracion'
        },
        timestamp: new Date().toISOString() 
    });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Probar conexión a la base de datos
const testDatabaseConnection = async() => {
    try {
        const result = await pool.query('SELECT NOW()');
        logger.info('Conexión a la base de datos exitosa:', result.rows[0].now);
    } catch (error) {
        logger.error('Error conectando a la base de datos:', error.message);
        logger.error('Detalles del error:', error);
    }
};

// Puerto
const PORT = process.env.PORT || 5000;

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    logger.error('Error no capturado:', { error: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promesa rechazada no manejada:', { reason: reason.stack });
    process.exit(1);
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    logger.error('Error en la aplicación:', {
        error: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ?
            'Error interno del servidor' : err.message
    });
});

const server = app.listen(PORT, '0.0.0.0', async() => {
    logger.info(`Servidor corriendo en el puerto ${PORT}`, {
        local: `http://127.0.0.1:${PORT}`,
        network: `http://192.168.1.34:${PORT}`
    });
    console.log(`📍 URL Local: http://127.0.0.1:${PORT}`);
    console.log(`📍 URL Alternativa: http://localhost:${PORT}`);
    console.log(`📍 URL Red: http://192.168.1.34:${PORT}`);
    await testDatabaseConnection();
});

server.on('error', (error) => {
    console.error('❌ Error del servidor:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso`);
    }
});