// src/routes/contacto.routes.js
const express = require('express');
const { enviarMensajeContacto } = require('../controllers/contacto.controller');

const router = express.Router();

// POST /api/contacto - Enviar mensaje de contacto
router.post('/', enviarMensajeContacto);

module.exports = router;