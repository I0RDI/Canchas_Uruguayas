import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'club-local-db';

type Torneo = { id: string; nombre: string; fecha: string; canchas: string[] };
type Arbitro = { id: string; nombre: string; telefono?: string; activo?: boolean };
type Partido = { id: string; arbitroId: string; torneoId?: string | null; fecha?: string; pagado?: boolean; pagoId?: string };
type CanchaEstado = { id: string; nombre: string; estado: 'Libre' | 'Ocupada'; alquiler?: { hora: string; cliente: string; fecha: string } | null };
type Movimiento = {
  id: string;
  concepto: string;
  tipo: 'renta' | 'pago_arbitro' | 'torneo' | 'cancha' | 'manual';
  monto: number;
  fecha: string;
  detalle?: Record<string, any>;
};
type Cierre = { fecha: string; total: number; movimientos: Movimiento[] };

type LocalDb = {
  torneos: Torneo[];
  arbitros: Arbitro[];
  partidos: Partido[];
  canchas: CanchaEstado[];
  caja: Movimiento[];
  cierres: Cierre[];
};

const defaultDb: LocalDb = {
  torneos: [],
  arbitros: [],
  partidos: [],
  canchas: [
    { id: 'cancha-grande', nombre: 'Cancha Grande', estado: 'Libre', alquiler: null },
    { id: 'cancha-1', nombre: 'Cancha 1', estado: 'Libre', alquiler: null },
    { id: 'cancha-2', nombre: 'Cancha 2', estado: 'Libre', alquiler: null },
    { id: 'cancha-3', nombre: 'Cancha 3', estado: 'Libre', alquiler: null },
  ],
  caja: [],
  cierres: [],
};

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

async function loadDb(): Promise<LocalDb> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultDb };
  const parsed = JSON.parse(saved);
  return {
    ...defaultDb,
    ...parsed,
    canchas: parsed.canchas || defaultDb.canchas,
    torneos: parsed.torneos || [],
    arbitros: parsed.arbitros || [],
    partidos: parsed.partidos || [],
    caja: parsed.caja || [],
    cierres: parsed.cierres || [],
  } as LocalDb;
}

async function saveDb(db: LocalDb) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const USERS = {
  propietario: { id: '1', nombre: 'Propietario', rol: 'propietario', password: 'canchas123' },
  empleado: { id: '2', nombre: 'Empleado', rol: 'empleado', password: 'empleado123' },
};

export async function login(username: string, password: string) {
  const key = username.trim().toLowerCase();
  const user = (USERS as any)[key];
  if (!user || user.password !== password) {
    throw new Error('Credenciales inválidas');
  }
  return { user: { id: user.id, nombre: user.nombre, rol: user.rol }, token: `local-${user.id}` };
}

export async function obtenerTorneos(_: string = '') {
  const db = await loadDb();
  return db.torneos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function crearTorneo(_: string = '', payload: { nombre: string; fecha: string; canchas: string[] }) {
  const db = await loadDb();
  const torneo: Torneo = { id: generateId('torneo'), ...payload };
  db.torneos = [torneo, ...db.torneos];
  await saveDb(db);
  return torneo;
}

export async function actualizarTorneo(_: string = '', id: string, payload: Partial<{ nombre: string; fecha: string; canchas: string[] }>) {
  const db = await loadDb();
  const idx = db.torneos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Torneo no encontrado');
  db.torneos[idx] = { ...db.torneos[idx], ...payload } as Torneo;
  await saveDb(db);
  return db.torneos[idx];
}

export async function eliminarTorneo(_: string = '', id: string) {
  const db = await loadDb();
  db.torneos = db.torneos.filter((t) => t.id !== id);
  await saveDb(db);
  return true;
}

export async function obtenerArbitros(_: string = '') {
  const db = await loadDb();
  return db.arbitros;
}

export async function crearArbitro(_: string = '', payload: { nombre: string; telefono?: string }) {
  const db = await loadDb();
  const nuevo: Arbitro = { id: generateId('arbitro'), ...payload, activo: true };
  db.arbitros = [nuevo, ...db.arbitros];
  await saveDb(db);
  return nuevo;
}

export async function actualizarArbitro(_: string = '', id: string, payload: Partial<{ nombre: string; telefono: string; activo: boolean }>) {
  const db = await loadDb();
  const idx = db.arbitros.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Árbitro no encontrado');
  db.arbitros[idx] = { ...db.arbitros[idx], ...payload } as Arbitro;
  await saveDb(db);
  return db.arbitros[idx];
}

export async function eliminarArbitro(_: string = '', id: string) {
  const db = await loadDb();
  db.arbitros = db.arbitros.filter((a) => a.id !== id);
  await saveDb(db);
  return true;
}

export async function crearPartido(_: string = '', payload: { arbitroId: string; torneoId?: string; fecha?: string }) {
  const db = await loadDb();
  const partido: Partido = { id: generateId('partido'), ...payload, pagado: false };
  db.partidos = [partido, ...db.partidos];
  await saveDb(db);
  return partido;
}

export async function pagarArbitro(_: string = '', partidoId: string) {
  const db = await loadDb();
  const partido = db.partidos.find((p) => p.id === partidoId);
  if (!partido) throw new Error('Partido no encontrado');
  partido.pagado = true;
  const movimiento: Movimiento = {
    id: generateId('mov'),
    concepto: 'Pago árbitro',
    tipo: 'pago_arbitro',
    monto: -500,
    fecha: new Date().toISOString(),
    detalle: { partidoId },
  };
  db.caja = [movimiento, ...db.caja];
  await saveDb(db);
  return partido;
}

export async function crearReserva(
  _: string,
  payload: { cancha: string; cliente: string; fecha: string; horaInicio: string; horaFin?: string; monto?: number; referencia?: string },
) {
  const db = await loadDb();
  const cancha = db.canchas.find((c) => c.nombre === payload.cancha || c.id === payload.cancha);
  if (!cancha) throw new Error('Cancha no encontrada');
  cancha.estado = 'Ocupada';
  cancha.alquiler = { hora: payload.horaInicio, cliente: payload.cliente, fecha: payload.fecha };
  if (payload.monto) {
    const movimiento: Movimiento = {
      id: generateId('mov'),
      concepto: `Renta ${cancha.nombre}`,
      tipo: 'cancha',
      monto: payload.monto,
      fecha: new Date().toISOString(),
      detalle: { cancha: cancha.nombre, cliente: payload.cliente, hora: payload.horaInicio },
    };
    db.caja = [movimiento, ...db.caja];
  }
  await saveDb(db);
  return cancha;
}

export async function liberarCancha(_: string, canchaId: string) {
  const db = await loadDb();
  const cancha = db.canchas.find((c) => c.id === canchaId);
  if (!cancha) throw new Error('Cancha no encontrada');
  cancha.estado = 'Libre';
  cancha.alquiler = null;
  await saveDb(db);
  return cancha;
}

export async function actualizarCanchaReserva(
  _: string,
  canchaId: string,
  payload: { cliente?: string; hora?: string; fecha?: string },
) {
  const db = await loadDb();
  const cancha = db.canchas.find((c) => c.id === canchaId);
  if (!cancha || !cancha.alquiler) throw new Error('La cancha no tiene una renta activa');
  cancha.alquiler = { ...cancha.alquiler, ...{ cliente: payload.cliente ?? cancha.alquiler.cliente, hora: payload.hora ?? cancha.alquiler.hora, fecha: payload.fecha ?? cancha.alquiler.fecha } };
  await saveDb(db);
  return cancha;
}

export async function movimientosCaja(_: string, fecha?: string) {
  const db = await loadDb();
  const hoy = fecha || new Date().toISOString().slice(0, 10);
  const movimientosDia = db.caja.filter((m) => (m.fecha || '').slice(0, 10) === hoy);
  const cerrado = db.cierres.some((c) => c.fecha === hoy);
  return { movimientos: movimientosDia, cerrado };
}

export async function registrarRenta(
  _: string,
  payload: { monto: number; referencia?: string; concepto: string; tipo: Movimiento['tipo']; detalle?: Record<string, any>; fecha?: string },
) {
  const db = await loadDb();
  const movimiento: Movimiento = {
    id: generateId('mov'),
    concepto: payload.concepto,
    tipo: payload.tipo,
    monto: Number(payload.monto.toFixed(2)),
    fecha: payload.fecha || new Date().toISOString(),
    detalle: payload.detalle,
  };
  db.caja = [movimiento, ...db.caja];
  await saveDb(db);
  return movimiento;
}

export async function calendarioDia(_: string, fecha: string) {
  const db = await loadDb();
  const reservas = db.canchas
    .filter((c) => c.alquiler && c.alquiler.fecha === fecha)
    .map((c) => ({
      id: c.id,
      tipo: 'reserva',
      cliente: c.alquiler?.cliente,
      horaInicio: c.alquiler?.hora,
      cancha: c.nombre,
    }));
  const partidos = db.partidos.filter((p) => p.fecha?.slice(0, 10) === fecha).map((p) => ({ ...p, tipo: 'partido' }));
  const torneos = db.torneos
    .filter((t) => t.fecha === fecha)
    .map((t) => ({ id: t.id, tipo: 'torneo', nombre: t.nombre, horaInicio: t.fecha, canchas: t.canchas }));
  return { reservas, partidos, torneos };
}

export async function reporteMensual(_: string, anio: number, mes: number) {
  const db = await loadDb();
  const mesStr = String(mes).padStart(2, '0');
  const ingresosRenta = db.caja
    .filter((m) => (m.fecha || '').startsWith(`${anio}-${mesStr}`) && m.monto > 0)
    .reduce((acc, m) => acc + m.monto, 0);
  const egresosArbitros = db.caja
    .filter((m) => (m.fecha || '').startsWith(`${anio}-${mesStr}`) && m.monto < 0)
    .reduce((acc, m) => acc + Math.abs(m.monto), 0);
  const detalleMovimientos = db.caja.filter((m) => (m.fecha || '').startsWith(`${anio}-${mesStr}`));
  const saldoNeto = ingresosRenta - egresosArbitros;
  return { ingresosRenta: ingresosRenta.toFixed(2), egresosArbitros: egresosArbitros.toFixed(2), saldoNeto: saldoNeto.toFixed(2), detalleMovimientos };
}

export async function cerrarDia(_: string, fecha?: string) {
  const db = await loadDb();
  const hoy = fecha || new Date().toISOString().slice(0, 10);
  const movimientosDia = db.caja.filter((m) => (m.fecha || '').slice(0, 10) === hoy);
  const total = movimientosDia.reduce((acc, m) => acc + m.monto, 0);
  const resumen: Cierre = { fecha: hoy, total, movimientos: movimientosDia };
  db.cierres = db.cierres.filter((c) => c.fecha !== hoy);
  db.cierres.push(resumen);
  await saveDb(db);
  return { message: 'Cierre completado', total, movimientos: movimientosDia };
}

export async function bitacora() {
  const db = await loadDb();
  return db.cierres;
}

export async function obtenerCanchas() {
  const db = await loadDb();
  return db.canchas;
}

export async function actualizarCanchaEstado(_: string, canchasActualizadas: CanchaEstado[]) {
  const db = await loadDb();
  db.canchas = canchasActualizadas;
  await saveDb(db);
  return db.canchas;
}
