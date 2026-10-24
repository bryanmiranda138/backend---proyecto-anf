-- =========================================================
-- RESPALDO DE BASE DE DATOS: FINANZASPRO SPA (SUPABASE)
-- Fecha de generación: 24/10/2026, 14:56:49
-- =========================================================

BEGIN;

-- Datos de la tabla: usuarios (2 registros)
INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, creado_en) VALUES (1, 'Administrador General', 'admin@empresa.com', '$2a$10$YsKulTQcpAOKxLYvHBjW5Od0GGxOpmO3kbJUmzy5jwtYc7L2nZMK.', 'admin', TRUE, '2026-10-24T02:48:34.122Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo, creado_en) VALUES (4, 'william Magaña', 'will@empresa.com', '$2b$10$3MyrabRtSJF3qh5Th6vosO8vwD8ts7F3h5z7Y6jx41S7nHVg9tqpa', 'empleado', TRUE, '2026-10-24T20:21:14.123Z') ON CONFLICT (id) DO NOTHING;

-- Datos de la tabla: categorias (6 registros)
INSERT INTO categorias (id, nombre, tipo, descripcion, activa) VALUES (1, 'Ventas de Productos', 'ingreso', 'Ingresos por ventas comerciales directas', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, tipo, descripcion, activa) VALUES (2, 'Servicios Profesionales', 'ingreso', 'Honorarios y consultorías', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, tipo, descripcion, activa) VALUES (3, 'Alquiler de Oficina', 'gasto', 'Pago mensual de arrendamiento', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, tipo, descripcion, activa) VALUES (4, 'Servicios Básicos', 'gasto', 'Agua, energía eléctrica e internet', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, tipo, descripcion, activa) VALUES (5, 'Transporte y Logística', 'gasto', 'Combustible, envíos y viáticos', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, tipo, descripcion, activa) VALUES (6, 'Suministros de Oficina', 'gasto', 'Papelería e insumos operativos', TRUE) ON CONFLICT (id) DO NOTHING;

-- Datos de la tabla: movimientos (1 registros)
INSERT INTO movimientos (id, usuario_id, categoria_id, tipo, concepto, monto, fecha, creado_en) VALUES (1, 1, 3, 'gasto', 'abc', '34.00', '2026-10-15T06:00:00.000Z', '2026-10-24T09:15:21.188Z') ON CONFLICT (id) DO NOTHING;

-- Datos de la tabla: bitacora (26 registros)
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (1, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '190.57.70.132, 172.71.156.232, 10.24.63.117', '2026-10-24T03:16:27.914Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (2, 1, 'Seguridad', 'Cierre de sesión', 'El usuario cerró sesión', '190.57.70.132, 172.71.151.204, 10.26.61.133', '2026-10-24T03:17:33.131Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (3, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '190.57.70.132, 104.22.160.48, 10.26.61.133', '2026-10-24T03:17:35.315Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (4, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.151.203, 10.29.97.133', '2026-10-24T08:50:59.299Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (5, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.68.12.26, 10.26.61.133', '2026-10-24T08:50:59.305Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (6, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.68.12.27, 10.26.61.133', '2026-10-24T08:50:59.304Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (7, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.68.12.26, 10.29.97.133', '2026-10-24T08:50:59.388Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (8, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.146.147, 10.24.63.117', '2026-10-24T08:50:59.497Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (9, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 108.162.210.221, 10.29.97.133', '2026-10-24T08:50:59.586Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (10, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 108.162.210.221, 10.26.61.133', '2026-10-24T08:51:00.700Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (11, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.151.204, 10.24.63.117', '2026-10-24T08:51:00.793Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (12, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.147.96, 10.29.97.133', '2026-10-24T08:55:29.085Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (13, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.68.12.27, 10.29.97.133', '2026-10-24T08:55:52.783Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (14, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.146.117, 10.26.61.133', '2026-10-24T08:55:52.959Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (15, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 104.23.248.91, 10.29.97.133', '2026-10-24T08:57:56.598Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (16, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.69.132.233, 10.26.61.133', '2026-10-24T09:02:23.904Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (17, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.69.132.233, 10.29.97.133', '2026-10-24T09:04:19.201Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (18, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.151.204, 10.24.63.117', '2026-10-24T09:07:31.693Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (19, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.151.151, 10.26.61.133', '2026-10-24T09:14:45.791Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (20, 1, 'Gastos', 'Registrar gasto', 'abc por $34', '201.247.37.62, 108.162.210.221, 10.29.97.133', '2026-10-24T09:15:21.256Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (21, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.146.120, 10.24.63.117', '2026-10-24T20:19:24.454Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (22, 1, 'Usuarios', 'Crear usuario', 'Creó al usuario will@empresa.com con rol empleado', '201.247.37.62, 172.71.146.129, 10.29.97.133', '2026-10-24T20:21:14.188Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (23, 1, 'Seguridad', 'Cierre de sesión', 'El usuario cerró sesión', '201.247.37.62, 172.71.147.238, 10.29.97.133', '2026-10-24T20:21:29.467Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (24, 4, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (will@empresa.com)', '201.247.37.62, 172.71.146.221, 10.29.97.133', '2026-10-24T20:21:34.956Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (25, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.69.132.233, 10.24.63.117', '2026-10-25T01:13:09.557Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO bitacora (id, usuario_id, modulo, accion, detalle, ip, fecha) VALUES (26, 1, 'Seguridad', 'Inicio de sesión', 'Ingreso exitoso (admin@empresa.com)', '201.247.37.62, 172.71.147.81, 10.29.97.133', '2026-10-25T01:13:10.260Z') ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('categorias', 'id'), COALESCE((SELECT MAX(id) FROM categorias), 1), true);
SELECT setval(pg_get_serial_sequence('movimientos', 'id'), COALESCE((SELECT MAX(id) FROM movimientos), 1), true);
SELECT setval(pg_get_serial_sequence('bitacora', 'id'), COALESCE((SELECT MAX(id) FROM bitacora), 1), true);

COMMIT;
