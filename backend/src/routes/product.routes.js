const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Estas rutas se implementarán más tarde
router.get('/', (req, res) => {
    res.json({ message: 'Ruta de productos' });
});

module.exports = router;