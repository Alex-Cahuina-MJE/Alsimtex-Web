const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('auth-token');
        
        if (!token) {
            return res.status(401).json({ error: 'No hay token, acceso denegado' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Error en el middleware de administrador' });
    }
};

// Mantener compatibilidad con código antiguo
const verifyToken = authMiddleware;

module.exports = {
    verifyToken,
    authMiddleware,
    adminMiddleware
};