const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por ventana
    message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos'
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // límite de 5 intentos de login por hora
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente en 1 hora'
});

module.exports = {
    securityMiddleware: [
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https:"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'", "https:", "data:"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" }
        }),
        rateLimiter
    ],
    authLimiter
};