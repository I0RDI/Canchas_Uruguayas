import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, 'data.json');
const JWT_SECRET = 'canchas-secret';

const app = express();
app.use(cors());
app.use(express.json());

const readData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const writeData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

const appendBitacora = (entry) => {
  const data = readData();
  const fecha_hora = new Date().toISOString();
  data.bitacora.unshift({ id: nanoid(), fecha_hora, ...entry });
  writeData(data);
};

const registrarMovimientoCaja = (data, { concepto, tipo, monto, referencia, usuario_id, partidoId, arbitroId, torneoId }) => {
  const fecha_hora = new Date().toISOString();
  const movimiento = {
    id: nanoid(),
    concepto,
    tipo,
    monto: Number(monto),
    fecha: fecha_hora,
    fecha_hora,
    referencia: referencia || null,
    usuario_id,
    partidoId: partidoId || null,
    arbitroId: arbitroId || null,
    torneoId: torneoId || null,
  };
  data.caja.unshift(movimiento);
  return movimiento;
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const data = readData();
  const user = data.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const payload = { id: user.id, rol: user.rol, nombre: user.nombre };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  appendBitacora({ usuario_id: user.id, accion: 'login', entidad: 'usuario', id_entidad: user.id });

  res.json({ token, ...payload, email: user.email, user: { ...payload, email: user.email } });
});

// Torneos CRUD
app.get('/torneos', authMiddleware, (req, res) => {
  const data = readData();
  res.json(data.torneos.filter((t) => t.activo !== false));
});

app.post('/torneos', authMiddleware, (req, res) => {
  const { nombre, fecha, canchas } = req.body;
  if (!nombre || !fecha || !Array.isArray(canchas) || canchas.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }
  const data = readData();
  const torneo = { id: nanoid(), nombre, fecha, canchas, creadoPor: req.user.id, activo: true };
  data.torneos.unshift(torneo);
  writeData(data);
  appendBitacora({ usuario_id: req.user.id, accion: 'crear_torneo', entidad: 'torneo', id_entidad: torneo.id });
  res.status(201).json(torneo);
});

app.put('/torneos/:id', authMiddleware, (req, res) => {
  const { nombre, fecha, canchas } = req.body;
  const data = readData();
  const torneo = data.torneos.find((t) => t.id === req.params.id && t.activo !== false);
  if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
  Object.assign(torneo, { nombre: nombre || torneo.nombre, fecha: fecha || torneo.fecha, canchas: canchas || torneo.canchas });
  writeData(data);
  res.json(torneo);
});

app.delete('/torneos/:id', authMiddleware, (req, res) => {
  const data = readData();
  const torneo = data.torneos.find((t) => t.id === req.params.id);
  if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });
  torneo.activo = false;
  writeData(data);
  res.json({ message: 'Torneo eliminado' });
});

// Árbitros CRUD
app.get('/arbitros', authMiddleware, (req, res) => {
  const data = readData();
  res.json(data.arbitros.filter((a) => a.activo !== false));
});

app.post('/arbitros', authMiddleware, (req, res) => {
  const { nombre, telefono } = req.body;
  if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
  const data = readData();
  const arbitro = { id: nanoid(), nombre, telefono: telefono || '', activo: true };
  data.arbitros.unshift(arbitro);
  writeData(data);
  res.status(201).json(arbitro);
});

app.put('/arbitros/:id', authMiddleware, (req, res) => {
  const data = readData();
  const arbitro = data.arbitros.find((a) => a.id === req.params.id);
  if (!arbitro) return res.status(404).json({ message: 'Árbitro no encontrado' });
  Object.assign(arbitro, { nombre: req.body.nombre ?? arbitro.nombre, telefono: req.body.telefono ?? arbitro.telefono, activo: req.body.activo ?? arbitro.activo });
  writeData(data);
  res.json(arbitro);
});

app.delete('/arbitros/:id', authMiddleware, (req, res) => {
  const data = readData();
  const arbitro = data.arbitros.find((a) => a.id === req.params.id);
  if (!arbitro) return res.status(404).json({ message: 'Árbitro no encontrado' });
  arbitro.activo = false;
  writeData(data);
  res.json({ message: 'Árbitro eliminado' });
});

// Partidos de prueba y pagos a árbitros
app.post('/partidos', authMiddleware, (req, res) => {
  const { arbitroId, torneoId, fecha } = req.body;
  if (!arbitroId) return res.status(400).json({ message: 'Arbitro requerido' });
  const data = readData();
  const arbitro = data.arbitros.find((a) => a.id === arbitroId);
  if (!arbitro) return res.status(400).json({ message: 'Árbitro no válido' });
  if (torneoId) {
    const torneoExiste = data.torneos.find((t) => t.id === torneoId && t.activo !== false);
    if (!torneoExiste) return res.status(400).json({ message: 'Torneo no válido' });
  }
  const partido = {
    id: nanoid(),
    arbitroId,
    torneoId: torneoId || null,
    fecha: fecha || new Date().toISOString(),
    pagado: false,
  };
  data.partidos.unshift(partido);
  writeData(data);
  appendBitacora({ usuario_id: req.user.id, accion: 'crear_partido', entidad: 'partido', id_entidad: partido.id, arbitroId });
  res.status(201).json(partido);
});

app.post('/partidos/:id/pago-arbitro', authMiddleware, (req, res) => {
  const data = readData();
  const partido = data.partidos.find((p) => p.id === req.params.id);
  if (!partido) return res.status(404).json({ message: 'Partido no encontrado' });
  if (partido.pagado) return res.status(400).json({ message: 'El árbitro ya fue pagado para este partido' });

  const movimiento = registrarMovimientoCaja(data, {
    concepto: 'Pago árbitro',
    tipo: 'pago_arbitro',
    monto: 240,
    usuario_id: req.user.id,
    partidoId: partido.id,
    arbitroId: partido.arbitroId,
    torneoId: partido.torneoId,
  });

  partido.pagado = true;
  partido.pagoId = movimiento.id;
  writeData(data);
  appendBitacora({ usuario_id: req.user.id, accion: 'pago_arbitro', entidad: 'partido', id_entidad: partido.id, detalle: movimiento.id });
  res.status(201).json(movimiento);
});

// Caja
app.get('/caja', authMiddleware, (req, res) => {
  const { fecha } = req.query;
  const targetDate = fecha ? new Date(fecha) : new Date();
  const day = targetDate.toISOString().slice(0, 10);
  const data = readData();
  const movimientos = data.caja
    .filter((m) => (m.fecha || m.fecha_hora || '').slice(0, 10) === day)
    .map((m) => ({ ...m, fecha: m.fecha || m.fecha_hora }));
  res.json(movimientos);
});

app.post('/caja/renta', authMiddleware, (req, res) => {
  const { monto, referencia } = req.body;
  if (!monto) return res.status(400).json({ message: 'Monto requerido' });
  const data = readData();
  const movimiento = registrarMovimientoCaja(data, {
    concepto: 'Renta cancha',
    tipo: 'renta',
    monto,
    referencia,
    usuario_id: req.user.id,
  });
  writeData(data);
  appendBitacora({ usuario_id: req.user.id, accion: 'crear_reserva', entidad: 'reserva', id_entidad: movimiento.id });
  res.status(201).json(movimiento);
});

app.get('/bitacora', authMiddleware, (req, res) => {
  const data = readData();
  res.json(data.bitacora.slice(0, 50));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});
