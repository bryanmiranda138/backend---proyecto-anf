require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Verificación rápida para asegurarnos de que el .env cargó la URL de Supabase
if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: No se encontró DATABASE_URL. Revisa tu archivo .env");
    process.exit(1);
}

// Configuración obligatoria para Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function ejecutarRespaldo() {
    const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dirBackups = path.join(__dirname, 'backups');

    if (!fs.existsSync(dirBackups)) {
        fs.mkdirSync(dirBackups);
    }

    const tablas = ['usuarios', 'categorias', 'movimientos', 'bitacora'];
    const respaldoJSON = {};
    let contenidoSQL = `-- =========================================================\n`;
    contenidoSQL += `-- RESPALDO DE BASE DE DATOS: FINANZASPRO SPA (SUPABASE)\n`;
    contenidoSQL += `-- Fecha de generación: ${new Date().toLocaleString()}\n`;
    contenidoSQL += `-- =========================================================\n\n`;
    contenidoSQL += `BEGIN;\n\n`;

    try {
        console.log('☁️ Conectando a Supabase para iniciar copia de seguridad...');

        for (const tabla of tablas) {
            const { rows } = await pool.query(`SELECT * FROM ${tabla} ORDER BY id ASC`);
            respaldoJSON[tabla] = rows;

            contenidoSQL += `-- Datos de la tabla: ${tabla} (${rows.length} registros)\n`;
            for (const fila of rows) {
                const columnas = Object.keys(fila).join(', ');
                const valores = Object.values(fila).map(val => {
                    if (val === null || val === undefined) return 'NULL';
                    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                    if (typeof val === 'number') return val;
                    if (val instanceof Date) return `'${val.toISOString()}'`;
                    return `'${String(val).replace(/'/g, "''")}'`;
                }).join(', ');

                contenidoSQL += `INSERT INTO ${tabla} (${columnas}) VALUES (${valores}) ON CONFLICT (id) DO NOTHING;\n`;
            }
            contenidoSQL += `\n`;
        }

        // Actualizar secuencias de IDs en PostgreSQL tras la restauración
        for (const tabla of tablas) {
            contenidoSQL += `SELECT setval(pg_get_serial_sequence('${tabla}', 'id'), COALESCE((SELECT MAX(id) FROM ${tabla}), 1), true);\n`;
        }

        contenidoSQL += `\nCOMMIT;\n`;

        const rutaSQL = path.join(dirBackups, `respaldo_finanzas_${fecha}.sql`);
        const rutaJSON = path.join(dirBackups, `respaldo_finanzas_${fecha}.json`);

        fs.writeFileSync(rutaSQL, contenidoSQL, 'utf8');
        fs.writeFileSync(rutaJSON, JSON.stringify(respaldoJSON, null, 2), 'utf8');

        console.log(`✅ Respaldo SQL guardado en: ${rutaSQL}`);
        console.log(`✅ Respaldo JSON guardado en: ${rutaJSON}`);
    } catch (error) {
        console.error('❌ Error al generar el respaldo:', error.message);
    } finally {
        await pool.end();
    }
}

ejecutarRespaldo();