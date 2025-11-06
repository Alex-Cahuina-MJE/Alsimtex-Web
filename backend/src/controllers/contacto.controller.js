// src/controllers/contacto.controller.js
const logger = require('../config/logger');

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

    // Aquí puedes agregar diferentes opciones:

    // OPCIÓN 1: Guardar en base de datos
    // const db = require('../db/database');
    // await db.query('INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje, fecha_envio) VALUES (?, ?, ?, ?, NOW())', 
    //   [nombre, email, telefono, mensaje]);

    // OPCIÓN 2: Enviar por email (necesitas configurar nodemailer)
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransporter({...});
    // await transporter.sendMail({
    //   from: email,
    //   to: 'contacto@alsimtex.com',
    //   subject: `Nuevo mensaje de ${nombre}`,
    //   html: `
    //     <h3>Nuevo mensaje de contacto</h3>
    //     <p><strong>Nombre:</strong> ${nombre}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
    //     <p><strong>Mensaje:</strong></p>
    //     <p>${mensaje}</p>
    //   `
    // });

    // OPCIÓN 3: Integrar con servicio externo (EmailJS, SendGrid, etc.)

    // Por ahora, solo loggear
    console.log('=== NUEVO MENSAJE DE CONTACTO ===');
    console.log(`Nombre: ${nombre}`);
    console.log(`Email: ${email}`);
    console.log(`Teléfono: ${telefono || 'No proporcionado'}`);
    console.log(`Mensaje: ${mensaje}`);
    console.log(`Fecha: ${new Date().toLocaleString()}`);
    console.log('===================================');

    res.status(200).json({
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.'
    });

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