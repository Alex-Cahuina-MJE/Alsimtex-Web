const pool = require('../db/database');
const path = require('path');

// Crear un nuevo pedido
const crearPedido = async(req, res) => {
    const client = await pool.connect();

    try {
        // Log para debug: mostrar el cuerpo recibido
        // Log detallado para depuración
        console.log('Pedido recibido:', req.body);
        console.log('Tipo de datos recibidos:');
        Object.entries(req.body).forEach(([key, value]) => {
            let tipo = Array.isArray(value) ? 'array' : typeof value;
            // Si es string y parece JSON, intenta parsear
            if (tipo === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    tipo = Array.isArray(parsed) ? 'array (json)' : typeof parsed;
                } catch {}
            }
            console.log(`  ${key}:`, value, `| tipo: ${tipo}`);
        });
        await client.query('BEGIN');


        // Parsear campos JSON si llegan como string (por FormData)
        let {
            usuario_id,
            datos_cliente,
            tipo_entrega,
            direccion_envio,
            metodo_pago,
            items,
            subtotal,
            descuento,
            costo_envio,
            total,
            estado
        } = req.body;

        // Normalizar campos numéricos para evitar errores de tipo en la base de datos
        function toNumberOrZero(val) {
            if (val === undefined || val === null || val === '' || val === 'null') return 0;
            const n = Number(val);
            return isNaN(n) ? 0 : n;
        }

        // Si la columna usuario_id permite null, dejarlo en null, si no, poner 0
        usuario_id = usuario_id === undefined || usuario_id === null || usuario_id === '' || usuario_id === 'null' ? null : Number(usuario_id);
        if (usuario_id !== null && isNaN(usuario_id)) usuario_id = 0;
        subtotal = toNumberOrZero(subtotal);
        descuento = toNumberOrZero(descuento);
        costo_envio = toNumberOrZero(costo_envio);
        total = toNumberOrZero(total);

        try {
            if (typeof datos_cliente === 'string') datos_cliente = JSON.parse(datos_cliente);
        } catch (e) {
            return res.status(400).json({ error: 'Error en datos_cliente: formato inválido' });
        }
        try {
            if (typeof items === 'string') items = JSON.parse(items);
        } catch (e) {
            return res.status(400).json({ error: 'Error en items: formato inválido' });
        }
        try {
            if (typeof direccion_envio === 'string') direccion_envio = JSON.parse(direccion_envio);
        } catch (e) {
            return res.status(400).json({ error: 'Error en direccion_envio: formato inválido' });
        }

        // Normalizar los items
        if (Array.isArray(items)) {
            items = items.map(item => {
                const safeItem = {...item };
                // Forzar todos los campos numéricos a número válido
                safeItem.producto_id = toNumberOrZero(item.producto_id);
                safeItem.cantidad = toNumberOrZero(item.cantidad);
                safeItem.precio_unitario = toNumberOrZero(item.precio_unitario);
                safeItem.precio_total = toNumberOrZero(item.precio_total);
                safeItem.descuento_aplicado = toNumberOrZero(item.descuento_aplicado);
                // Si algún campo es null o string 'null', poner 0
                Object.keys(safeItem).forEach(k => {
                    if (safeItem[k] === null || safeItem[k] === 'null') safeItem[k] = 0;
                });
                return safeItem;
            });
        }

        // Obtener la ruta del documento de pago si se subió
        const documentoPago = req.file ? `/uploads/documentos-pago/${req.file.filename}` : null;

        // Validar datos requeridos
        if (!datos_cliente || !metodo_pago || !items || items.length === 0) {
            return res.status(400).json({
                error: 'Faltan datos requeridos para crear el pedido'
            });
        }

        // Validar dirección solo si es envío
        if (tipo_entrega === 'envio' && !direccion_envio) {
            return res.status(400).json({
                error: 'La dirección de envío es requerida para entregas a domicilio'
            });
        }

        // Generar número de pedido único
        const numeroPedido = `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Insertar el pedido principal
        const pedidoQuery = `
            INSERT INTO pedidos (
                numero_pedido,
                usuario_id,
                datos_cliente,
                tipo_entrega,
                direccion_envio,
                metodo_pago,
                subtotal,
                descuento,
                costo_envio,
                total,
                estado,
                documento_pago,
                fecha_pedido
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            RETURNING *
        `;

        const pedidoResult = await client.query(pedidoQuery, [
            numeroPedido,
            usuario_id || null,
            JSON.stringify(datos_cliente),
            tipo_entrega || 'envio',
            direccion_envio ? JSON.stringify(direccion_envio) : null,
            metodo_pago,
            subtotal,
            descuento || 0,
            costo_envio || 0,
            total,
            estado || 'pendiente',
            documentoPago
        ]);

        const pedido = pedidoResult.rows[0];

        // Insertar los items del pedido
        for (const item of items) {
            const itemQuery = `
                INSERT INTO pedido_items (
                    pedido_id,
                    producto_id,
                    cantidad,
                    precio_unitario,
                    tipo,
                    tamano,
                    notas,
                    precio_total,
                    descuento_aplicado
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;

            await client.query(itemQuery, [
                pedido.id,
                item.producto_id,
                item.cantidad,
                item.precio_unitario,
                item.tipo || '',
                item.tamano || '',
                item.notas || '',
                item.precio_total,
                item.descuento_aplicado || 0
            ]);

            // Actualizar el stock del producto
            const updateStockQuery = `
                UPDATE productos 
                SET stock = stock - $1 
                WHERE id = $2 AND stock >= $1
            `;

            const updateResult = await client.query(updateStockQuery, [
                item.cantidad,
                item.producto_id
            ]);

            if (updateResult.rowCount === 0) {
                throw new Error(`Stock insuficiente para el producto ID ${item.producto_id}`);
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            pedido: {
                id: pedido.id,
                numero_pedido: pedido.numero_pedido,
                total: pedido.total,
                estado: pedido.estado,
                fecha_pedido: pedido.fecha_pedido
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear pedido:', error);
        res.status(500).json({
            error: error.message || 'Error al crear el pedido'
        });
    } finally {
        client.release();
    }
};

// Obtener todos los pedidos (para admin)
const obtenerPedidos = async(req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                COUNT(pi.id) as total_items,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', pi.id,
                        'producto_id', pi.producto_id,
                        'cantidad', pi.cantidad,
                        'precio_unitario', pi.precio_unitario,
                        'tipo', pi.tipo,
                        'tamano', pi.tamano,
                        'notas', pi.notas,
                        'precio_total', pi.precio_total,
                        'producto_nombre', prod.nombre,
                        'imagen_principal', prod.imagen_principal
                    )
                ) as items_detalle
            FROM pedidos p
            LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
            LEFT JOIN productos prod ON pi.producto_id = prod.id
            GROUP BY p.id
            ORDER BY p.fecha_pedido DESC
        `;

        const result = await pool.query(query);

        // Filtrar items nulos si no hay items en el pedido
        const pedidos = result.rows.map(pedido => {
            if (pedido.items_detalle && pedido.items_detalle[0] === null) {
                pedido.items_detalle = [];
            }
            return pedido;
        });

        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
};

// Obtener un pedido por ID con sus items
const obtenerPedidoPorId = async(req, res) => {
    try {
        const { id } = req.params;

        // Obtener el pedido
        const pedidoQuery = 'SELECT * FROM pedidos WHERE id = $1';
        const pedidoResult = await pool.query(pedidoQuery, [id]);

        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedido = pedidoResult.rows[0];

        // Obtener los items del pedido con información del producto
        const itemsQuery = `
            SELECT 
                pi.*,
                p.nombre as producto_nombre,
                p.imagen_principal
            FROM pedido_items pi
            LEFT JOIN productos p ON pi.producto_id = p.id
            WHERE pi.pedido_id = $1
        `;

        const itemsResult = await pool.query(itemsQuery, [id]);

        res.json({
            ...pedido,
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error al obtener el pedido' });
    }
};

// Actualizar estado del pedido
const actualizarEstadoPedido = async(req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const query = `
            UPDATE pedidos 
            SET estado = $1, fecha_actualizacion = NOW()
            WHERE id = $2
            RETURNING *
        `;

        const result = await pool.query(query, [estado, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
};

// Obtener pedidos por usuario
const obtenerPedidosPorUsuario = async(req, res) => {
    try {
        const { usuario_id } = req.params;

        const query = `
            SELECT 
                p.*,
                COUNT(pi.id) as total_items
            FROM pedidos p
            LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
            WHERE p.usuario_id = $1
            GROUP BY p.id
            ORDER BY p.id ASC
        `;

        const result = await pool.query(query, [usuario_id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
};

// Obtener estadísticas de ventas para dashboard
const obtenerEstadisticasVentas = async(req, res) => {
    try {
        // Obtener ventas totales del mes actual
        const ventasMesQuery = `
            SELECT 
                COALESCE(SUM(total), 0) as total_mes,
                COUNT(*) as pedidos_mes
            FROM pedidos
            WHERE 
                EXTRACT(MONTH FROM fecha_pedido) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND estado != 'cancelado'
        `;
        const ventasMesResult = await pool.query(ventasMesQuery);
        
        // Obtener ventas del mes anterior para calcular crecimiento
        const ventasMesAnteriorQuery = `
            SELECT 
                COALESCE(SUM(total), 0) as total_mes_anterior
            FROM pedidos
            WHERE 
                EXTRACT(MONTH FROM fecha_pedido) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
                AND EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
                AND estado != 'cancelado'
        `;
        const ventasMesAnteriorResult = await pool.query(ventasMesAnteriorQuery);
        
        // Calcular crecimiento
        const ventasMes = parseFloat(ventasMesResult.rows[0].total_mes) || 0;
        const ventasMesAnterior = parseFloat(ventasMesAnteriorResult.rows[0].total_mes_anterior) || 1;
        const crecimiento = ventasMesAnterior > 0 
            ? Math.round(((ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100)
            : 0;
        
        // Obtener ventas por mes (últimos 12 meses)
        const ventasPorMesQuery = `
            SELECT 
                EXTRACT(MONTH FROM fecha_pedido) as mes,
                COALESCE(SUM(total), 0) as total
            FROM pedidos
            WHERE 
                fecha_pedido >= CURRENT_DATE - INTERVAL '12 months'
                AND estado != 'cancelado'
            GROUP BY EXTRACT(MONTH FROM fecha_pedido)
            ORDER BY mes
        `;
        const ventasPorMesResult = await pool.query(ventasPorMesQuery);
        
        // Crear array de 12 meses con valores inicializados en 0
        const ventasPorMes = Array(12).fill(0);
        ventasPorMesResult.rows.forEach(row => {
            const mesIndex = parseInt(row.mes) - 1;
            ventasPorMes[mesIndex] = parseFloat(row.total);
        });
        
        // Obtener total de productos vendidos
        const productosVendidosQuery = `
            SELECT 
                COALESCE(SUM(pi.cantidad), 0) as total_productos
            FROM pedido_items pi
            JOIN pedidos p ON pi.pedido_id = p.id
            WHERE p.estado != 'cancelado'
        `;
        const productosVendidosResult = await pool.query(productosVendidosQuery);
        
        res.json({
            ventasMes: ventasMes,
            pedidosMes: parseInt(ventasMesResult.rows[0].pedidos_mes) || 0,
            crecimiento: crecimiento,
            ventasPorMes: ventasPorMes,
            productosVendidos: parseInt(productosVendidosResult.rows[0].total_productos) || 0
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de ventas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};

module.exports = {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    actualizarEstadoPedido,
    obtenerPedidosPorUsuario,
    obtenerEstadisticasVentas
};