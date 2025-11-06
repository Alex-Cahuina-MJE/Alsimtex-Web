const express = require('express');
const router = express.Router();
const {
    getConfiguracion,
    updateConfiguracion
} = require('../controllers/configuracion.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Ruta para obtener la configuración (accesible para cualquier usuario autenticado)
router.get('/', authMiddleware, getConfiguracion);

// Ruta para actualizar la configuración (solo para administradores)
router.put('/', authMiddleware, adminMiddleware, updateConfiguracion);

module.exports = router;