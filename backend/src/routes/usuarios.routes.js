const express = require('express');
const router = express.Router();
const {
    getAllUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    cambiarRol,
    getEstadisticas
} = require('../controllers/usuarios.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y permisos de admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAllUsuarios);
router.get('/estadisticas', getEstadisticas);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);
router.patch('/:id/cambiar-rol', cambiarRol);

module.exports = router;
