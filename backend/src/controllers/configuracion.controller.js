const pool = require('../db/database');

// Obtener toda la configuración
const getConfiguracion = async (req, res) => {
    try {
        const result = await pool.query('SELECT clave, valor FROM empresa_configuracion');
        
        // Convertir el array de resultados en un objeto clave-valor
        const configuracion = result.rows.reduce((acc, row) => {
            acc[row.clave] = row.valor;
            return acc;
        }, {});

        res.json({
            success: true,
            configuracion
        });
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Actualizar una o varias configuraciones
const updateConfiguracion = async (req, res) => {
    try {
        const { clave, valor } = req.body;

        if (!clave) {
            return res.status(400).json({
                success: false,
                error: 'La "clave" es obligatoria para actualizar la configuración.'
            });
        }

        const result = await pool.query(
            `INSERT INTO empresa_configuracion (clave, valor, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (clave) 
             DO UPDATE SET valor = EXCLUDED.valor, updated_at = CURRENT_TIMESTAMP
             RETURNING clave, valor;`,
            [clave, valor]
        );

        console.log('✅ Configuración actualizada:', result.rows[0]);

        res.json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            configuracion: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando configuración:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

module.exports = {
    getConfiguracion,
    updateConfiguracion
};