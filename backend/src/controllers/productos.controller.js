const pool = require('../db/database');

// Obtener todos los productos
const getAllProductos = async(req, res) => {
    try {
        const { categoria, subcategoria, estado, search } = req.query;

        let query = 'SELECT * FROM productos WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (categoria) {
            query += ` AND categoria = $${paramCount}`;
            params.push(categoria);
            paramCount++;
        }

        if (subcategoria) {
            query += ` AND subcategoria = $${paramCount}`;
            params.push(subcategoria);
            paramCount++;
        }

        if (estado !== undefined) {
            query += ` AND estado = $${paramCount}`;
            params.push(estado === 'true');
            paramCount++;
        }

        if (search) {
            query += ` AND (nombre ILIKE $${paramCount} OR descripcion ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ' ORDER BY id ASC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            productos: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obtener un producto por ID
const getProductoById = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM productos WHERE id = $1', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Crear nuevo producto
const createProducto = async(req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio_base,
            categoria,
            subcategoria,
            imagenes,
            imagen_principal,
            stock,
            estado,
            descuento
        } = req.body;

        // Validaciones
        if (!nombre || !precio_base || !categoria) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, precio base y categoría son obligatorios'
            });
        }

        const result = await pool.query(
            `INSERT INTO productos 
            (nombre, descripcion, precio_base, categoria, subcategoria, 
             imagenes, imagen_principal, stock, estado, descuento)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`, [
                nombre,
                descripcion || null,
                precio_base,
                categoria,
                subcategoria || null,
                imagenes || null,
                imagen_principal || null,
                stock || 0,
                estado !== undefined ? estado : true,
                descuento || 0
            ]
        );

        console.log('✅ Producto creado:', result.rows[0].nombre);

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Actualizar producto
const updateProducto = async(req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            precio_base,
            categoria,
            subcategoria,
            imagenes,
            imagen_principal,
            stock,
            estado,
            descuento
        } = req.body;

        // Verificar que el producto existe
        const checkProduct = await pool.query(
            'SELECT * FROM productos WHERE id = $1', [id]
        );

        if (checkProduct.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        const result = await pool.query(
            `UPDATE productos 
            SET nombre = $1, descripcion = $2, precio_base = $3, categoria = $4, 
                subcategoria = $5, imagenes = $6, imagen_principal = $7,
                stock = $8, estado = $9, descuento = $10, updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING *`, [
                nombre,
                descripcion,
                precio_base,
                categoria,
                subcategoria,
                imagenes,
                imagen_principal,
                stock,
                estado,
                descuento || 0,
                id
            ]
        );

        console.log('✅ Producto actualizado:', result.rows[0].nombre);

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Eliminar producto
const deleteProducto = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM productos WHERE id = $1 RETURNING *', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        console.log('✅ Producto eliminado:', result.rows[0].nombre);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Cambiar estado del producto
const toggleEstadoProducto = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE productos SET estado = NOT estado, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        console.log('✅ Estado del producto cambiado:', result.rows[0].nombre, '- Estado:', result.rows[0].estado);

        res.json({
            success: true,
            message: 'Estado del producto actualizado',
            producto: result.rows[0]
        });
    } catch (error) {
        console.error('Error cambiando estado:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obtener categorías únicas
const getCategorias = async(req, res) => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL ORDER BY categoria'
        );

        res.json({
            success: true,
            categorias: result.rows.map(row => row.categoria)
        });
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obtener subcategorías únicas
const getSubcategorias = async(req, res) => {
    try {
        const { categoria } = req.query;

        let query = 'SELECT DISTINCT subcategoria FROM productos WHERE subcategoria IS NOT NULL';
        const params = [];

        if (categoria) {
            query += ' AND categoria = $1';
            params.push(categoria);
        }

        query += ' ORDER BY subcategoria';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            subcategorias: result.rows.map(row => row.subcategoria)
        });
    } catch (error) {
        console.error('Error obteniendo subcategorías:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    toggleEstadoProducto,
    getCategorias,
    getSubcategorias
};