// src/controllers/contacto.controller.js
const logger = require('../config/logger');
const nodemailer = require('nodemailer');

// Configuración básica para pruebas (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tucorreo@gmail.com', // Cambia por tu correo de envío
    pass: 'tu_contraseña_app'   // Usa contraseña de aplicación o token
  }
});

const enviarMensajeContacto = async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        error: 'Nombre, email y mensaje son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    // Log del mensaje recibido
    logger.info('Nuevo mensaje de contacto recibido:', {
      nombre: nombre,
      email: email,
      telefono: telefono || 'No proporcionado',
      timestamp: new Date().toISOString()
    });


    // Enviar correo
    try {
      logger.info('Intentando enviar correo de contacto...', {
        from: 'ALSIMTEX Web <tucorreo@gmail.com>',
        to: 'contacto@alsimtex.com',
        subject: `Nuevo mensaje de contacto de ${nombre}`
      });
      const info = await transporter.sendMail({
        from: 'ALSIMTEX Web <tucorreo@gmail.com>', // Cambia por tu correo de envío
        to: 'contacto@alsimtex.com', // Cambia por el correo de destino
        subject: `Nuevo mensaje de contacto de ${nombre}`,
        html: `
          <h3>Nuevo mensaje de contacto</h3>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje}</p>
        `
      });
      logger.info('Correo enviado correctamente:', info);
      res.status(200).json({
        success: true,
        message: 'Mensaje enviado exitosamente. Te contactaremos pronto.'
      });
    } catch (err) {
      logger.error('Error al enviar correo de contacto:', err);
      res.status(500).json({
        error: 'No se pudo enviar el mensaje por correo. Intenta más tarde.'
      });
    }

  } catch (error) {
    logger.error('Error al procesar mensaje de contacto:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  enviarMensajeContacto
};