const express = require('express');
const router = express.Router();
const {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    actualizarEstadoPedido,
    obtenerPedidosPorUsuario,
    obtenerEstadisticasVentas
} = require('../controllers/pedidos.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');

// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros dinámicos

// Rutas de administrador con paths específicos (PRIMERO)
router.get('/estadisticas/ventas', authMiddleware, adminMiddleware, obtenerEstadisticasVentas); // Estadísticas de ventas

// Rutas con múltiples segmentos (SEGUNDO)
router.get('/usuario/:usuario_id', authMiddleware, obtenerPedidosPorUsuario); // Pedidos de un usuario

// Rutas genéricas (TERCERO)
router.get('/', authMiddleware, adminMiddleware, obtenerPedidos); // Todos los pedidos
router.post('/', upload.single('documentoPago'), handleMulterError, crearPedido); // Crear pedido

// Rutas con parámetros dinámicos (ÚLTIMO - para evitar conflictos)
router.get('/:id', authMiddleware, obtenerPedidoPorId); // Detalle de un pedido
router.put('/:id/estado', authMiddleware, adminMiddleware, actualizarEstadoPedido); // Actualizar estado

module.exports = router;
