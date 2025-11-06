const express = require('express');
const router = express.Router();
const {
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    toggleEstadoProducto,
    getCategorias,
    getSubcategorias
} = require('../controllers/productos.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', getAllProductos);
router.get('/categorias', getCategorias);
router.get('/subcategorias', getSubcategorias);
router.get('/:id', getProductoById);

// Rutas protegidas (solo admin)
router.post('/', authMiddleware, adminMiddleware, createProducto);
router.put('/:id', authMiddleware, adminMiddleware, updateProducto);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProducto);
router.patch('/:id/toggle-estado', authMiddleware, adminMiddleware, toggleEstadoProducto);

module.exports = router;
