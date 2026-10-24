require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_empresarial_2026';

// Conexión a PostgreSQL (Supabase / Nube)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido por Supabase en conexiones externas
    }
});

// Helper: Registrar en Bitácora (Módulo 7)
async function registrarBitacora(usuarioId, modulo, accion, detalle, req) {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        await pool.query(
            `INSERT INTO bitacora (usuario_id, modulo, accion, detalle, ip) VALUES ($1, $2, $3, $4, $5)`,
            [usuarioId, modulo, accion, detalle, ip]
        );
    } catch (err) {
        console.error('Error en bitácora:', err.message);
    }
}

// Middleware: Verificar sesión JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado. Inicie sesión.' });

    jwt.verify(token, JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({ error: 'Sesión expirada o inválida.' });
        req.usuario = usuario;
        next();
    });
}

// Middleware: Restringir a Administradores
function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes. Se requiere rol Administrador.' });
    }
    next();
}

/* =========================================================
   MÓDULO 1: AUTENTICACIÓN Y USUARIOS
   ========================================================= */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas.' });

        const user = rows[0];
        if (!user.activo) return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' });

        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(401).json({ error: 'Credenciales incorrectas.' });

        const token = jwt.sign(
            { id: user.id, nombre: user.nombre, rol: user.rol },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        await registrarBitacora(user.id, 'Seguridad', 'Inicio de sesión', `Ingreso exitoso (${user.email})`, req);
        res.json({ token, usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor.' });
    }
});

app.post('/api/auth/logout', verificarToken, async (req, res) => {
    await registrarBitacora(req.usuario.id, 'Seguridad', 'Cierre de sesión', 'El usuario cerró sesión', req);
    res.json({ mensaje: 'Sesión cerrada correctamente.' });
});

app.get('/api/usuarios', verificarToken, soloAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, nombre, email, rol, activo, creado_en FROM usuarios ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios.' });
    }
});

app.post('/api/usuarios', verificarToken, soloAdmin, async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, activo`,
            [nombre, email, hash, rol]
        );
        await registrarBitacora(req.usuario.id, 'Usuarios', 'Crear usuario', `Creó al usuario ${email} con rol ${rol}`, req);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: 'No se pudo registrar el usuario. Verifique que el correo no esté duplicado.' });
    }
});

app.put('/api/usuarios/:id', verificarToken, soloAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;
    try {
        let result;
        if (password && password.trim() !== '') {
            const hash = await bcrypt.hash(password, 10);
            result = await pool.query(
                `UPDATE usuarios SET nombre = $1, email = $2, password_hash = $3, rol = $4 WHERE id = $5 RETURNING id, nombre, email, rol, activo`,
                [nombre, email, hash, rol, id]
            );
        } else {
            result = await pool.query(
                `UPDATE usuarios SET nombre = $1, email = $2, rol = $3 WHERE id = $4 RETURNING id, nombre, email, rol, activo`,
                [nombre, email, rol, id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        await registrarBitacora(req.usuario.id, 'Usuarios', 'Modificar usuario', `Actualizó usuario ID ${id} (${email}, rol: ${rol})`, req);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: 'No se pudo actualizar el usuario. Verifique que el correo no esté en uso.' });
    }
});

app.patch('/api/usuarios/:id/estado', verificarToken, soloAdmin, async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, email, activo',
            [activo, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        await registrarBitacora(req.usuario.id, 'Usuarios', 'Cambio de estado', `Usuario ID ${id} activo=${activo}`, req);
        res.json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: 'No se pudo cambiar el estado del usuario.' });
    }
});

/* =========================================================
   MÓDULO 4: CATEGORÍAS FINANCIERAS
   ========================================================= */
app.get('/api/categorias', verificarToken, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categorias ORDER BY tipo, nombre');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar categorías.' });
    }
});

app.post('/api/categorias', verificarToken, soloAdmin, async (req, res) => {
    const { nombre, tipo, descripcion } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO categorias (nombre, tipo, descripcion) VALUES ($1, $2, $3) RETURNING *',
            [nombre, tipo, descripcion || null]
        );
        await registrarBitacora(req.usuario.id, 'Categorías', 'Crear categoría', `Nueva categoría: ${nombre} (${tipo})`, req);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/categorias/:id', verificarToken, soloAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, descripcion } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE categorias SET nombre = $1, tipo = $2, descripcion = $3 WHERE id = $4 RETURNING *',
            [nombre, tipo, descripcion || null, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });

        await registrarBitacora(req.usuario.id, 'Categorías', 'Modificar categoría', `ID ${id}: ${nombre} (${tipo})`, req);
        res.json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/categorias/:id/estado', verificarToken, soloAdmin, async (req, res) => {
    const { id } = req.params;
    const { activa } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE categorias SET activa = $1 WHERE id = $2 RETURNING *',
            [activa, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });

        await registrarBitacora(req.usuario.id, 'Categorías', 'Cambio de estado', `Categoría ID ${id} activa=${activa}`, req);
        res.json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/* =========================================================
   MÓDULOS 2 Y 3: INGRESOS Y GASTOS (MOVIMIENTOS)
   ========================================================= */
app.get('/api/movimientos', verificarToken, async (req, res) => {
    const { fechaInicio, fechaFin, tipo, categoria_id } = req.query;
    let query = `
        SELECT m.id, m.concepto, m.monto, m.tipo, TO_CHAR(m.fecha, 'YYYY-MM-DD') AS fecha,
               c.nombre AS categoria, u.nombre AS registrado_por, m.categoria_id
        FROM movimientos m
        JOIN categorias c ON m.categoria_id = c.id
        JOIN usuarios u ON m.usuario_id = u.id
        WHERE 1=1
    `;
    const params = [];

    if (fechaInicio) { params.push(fechaInicio); query += ` AND m.fecha >= $${params.length}`; }
    if (fechaFin) { params.push(fechaFin); query += ` AND m.fecha <= $${params.length}`; }
    if (tipo) { params.push(tipo); query += ` AND m.tipo = $${params.length}`; }
    if (categoria_id) { params.push(categoria_id); query += ` AND m.categoria_id = $${params.length}`; }

    query += ' ORDER BY m.fecha DESC, m.id DESC';
    try {
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar movimientos.' });
    }
});

app.post('/api/movimientos', verificarToken, async (req, res) => {
    const { categoria_id, tipo, concepto, monto, fecha } = req.body;
    if (Number(monto) <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor que cero.' });
    }
    try {
        // Validación de integridad: verificar que la categoría corresponda al tipo de movimiento
        const catCheck = await pool.query('SELECT tipo, activa FROM categorias WHERE id = $1', [categoria_id]);
        if (catCheck.rows.length === 0) {
            return res.status(400).json({ error: 'La categoría seleccionada no existe.' });
        }
        if (catCheck.rows[0].tipo !== tipo) {
            return res.status(400).json({ error: `La categoría seleccionada no corresponde al tipo ${tipo}.` });
        }

        const { rows } = await pool.query(
            `INSERT INTO movimientos (usuario_id, categoria_id, tipo, concepto, monto, fecha)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.usuario.id, categoria_id, tipo, concepto, monto, fecha]
        );
        await registrarBitacora(
            req.usuario.id,
            tipo === 'ingreso' ? 'Ingresos' : 'Gastos',
            `Registrar ${tipo}`,
            `${concepto} por $${monto}`,
            req
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/movimientos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { tipo, categoria_id, concepto, monto, fecha } = req.body;
    if (Number(monto) <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor que cero.' });
    }
    try {
        // Validación de integridad: verificar correspondencia entre categoría y tipo
        const catCheck = await pool.query('SELECT tipo FROM categorias WHERE id = $1', [categoria_id]);
        if (catCheck.rows.length === 0) {
            return res.status(400).json({ error: 'La categoría seleccionada no existe.' });
        }
        if (tipo && catCheck.rows[0].tipo !== tipo) {
            return res.status(400).json({ error: `La categoría no corresponde al tipo ${tipo}.` });
        }

        const tipoFinal = tipo || catCheck.rows[0].tipo;
        const { rows } = await pool.query(
            `UPDATE movimientos
             SET categoria_id = $1, tipo = $2, concepto = $3, monto = $4, fecha = $5
             WHERE id = $6 RETURNING *`,
            [categoria_id, tipoFinal, concepto, monto, fecha, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Movimiento no encontrado.' });

        await registrarBitacora(req.usuario.id, 'Movimientos', 'Modificar registro', `ID ${id}: ${concepto} ($${monto})`, req);
        res.json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/* =========================================================
   MÓDULOS 5 Y 6: PANEL FINANCIERO Y REPORTES
   ========================================================= */
app.get('/api/finanzas/resumen', verificarToken, async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    const params = [];
    let filtroFecha = '';

    if (fechaInicio) { params.push(fechaInicio); filtroFecha += ` AND m.fecha >= $${params.length}`; }
    if (fechaFin) { params.push(fechaFin); filtroFecha += ` AND m.fecha <= $${params.length}`; }

    try {
        // 1. Cálculo de Totales
        const totalesQuery = `
            SELECT
                COALESCE(SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END), 0) AS ingresos_totales,
                COALESCE(SUM(CASE WHEN m.tipo = 'gasto' THEN m.monto ELSE 0 END), 0) AS gastos_totales
            FROM movimientos m
            WHERE 1=1 ${filtroFecha}
        `;
        const { rows } = await pool.query(totalesQuery, params);
        const ingresosTotales = parseFloat(rows[0].ingresos_totales);
        const gastosTotales = parseFloat(rows[0].gastos_totales);

        // Resultado financiero = Ingresos totales - Gastos totales
        const resultadoFinanciero = ingresosTotales - gastosTotales;
        // Porcentaje de gastos = (Gastos totales / Ingresos totales) * 100 (si ingresos > 0)
        const porcentajeGastos = ingresosTotales > 0
            ? ((gastosTotales / ingresosTotales) * 100)
            : 0;

        // 2. Desglose por categoría para gráficos
        const porCategoriaQuery = `
            SELECT c.nombre AS categoria, m.tipo, SUM(m.monto) AS total
            FROM movimientos m
            JOIN categorias c ON m.categoria_id = c.id
            WHERE 1=1 ${filtroFecha}
            GROUP BY c.nombre, m.tipo
            ORDER BY total DESC
        `;
        const categoriasResult = await pool.query(porCategoriaQuery, params);

        res.json({
            ingresosTotales: Number(ingresosTotales.toFixed(2)),
            gastosTotales: Number(gastosTotales.toFixed(2)),
            resultadoFinanciero: Number(resultadoFinanciero.toFixed(2)),
            porcentajeGastos: Number(porcentajeGastos.toFixed(2)),
            desgloseCategorias: categoriasResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al calcular el resumen financiero.' });
    }
});

/* =========================================================
   MÓDULO 7: CONSULTA DE BITÁCORA
   ========================================================= */
app.get('/api/bitacora', verificarToken, soloAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT b.id, COALESCE(u.nombre, 'Sistema') AS usuario, b.modulo, b.accion,
                   b.detalle, b.ip, TO_CHAR(b.fecha, 'YYYY-MM-DD HH24:MI:SS') AS fecha
            FROM bitacora b
            LEFT JOIN usuarios u ON b.usuario_id = u.id
            ORDER BY b.fecha DESC LIMIT 100
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar la bitácora.' });
    }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
}

module.exports = app;