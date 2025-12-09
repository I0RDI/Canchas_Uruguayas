import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'club-local-db';

type Torneo = { id: string; nombre: string; fecha: string; canchas: string[] };
type Arbitro = { id: string; nombre: string; telefono?: string; activo?: boolean };
type Partido = { id: string; arbitroId: string; torneoId?: string | null; fecha?: string; pagado?: boolean; pagoId?: string };
type CanchaEstado = { id: string; nombre: string; estado: 'Libre' | 'Ocupada'; alquiler?: { hora: string; cliente: string; fecha: string } | null };
type Reserva = { id: string; canchaId: string; cancha: string; cliente: string; fecha: string; horaInicio: string };
type Movimiento = {
  id: string;
  concepto: string;
  tipo: 'renta' | 'pago_arbitro' | 'torneo' | 'cancha' | 'manual';
  monto: number;
  fecha: string;
  detalle?: Record<string, any>;
};
type Cierre = {
  fecha: string;
  total: number;
  movimientos: Movimiento[];
  ingresos: number;
  egresos: number;
};

type DiaAbiertoState = {
  diaAbiertoActual: string | null;
};

type LocalDb = {
  torneos: Torneo[];
  arbitros: Arbitro[];
  partidos: Partido[];
  canchas: CanchaEstado[];
  reservas: Reserva[];
  caja: Movimiento[];
  cierres: Cierre[];
  aperturas: string[];
  diaAbiertoActual: DiaAbiertoState['diaAbiertoActual'];
};

const defaultDb: LocalDb = {
  torneos: [],
  arbitros: [],
  partidos: [],
  canchas: [
    { id: 'cancha-pasto', nombre: 'Cancha Pasto', estado: 'Libre', alquiler: null },
    { id: 'cancha-1', nombre: 'Cancha 1', estado: 'Libre', alquiler: null },
    { id: 'cancha-2', nombre: 'Cancha 2', estado: 'Libre', alquiler: null },
    { id: 'cancha-3', nombre: 'Cancha 3', estado: 'Libre', alquiler: null },
    { id: 'cancha-4', nombre: 'Cancha 4', estado: 'Libre', alquiler: null },
  ],
  reservas: [],
  caja: [],
  cierres: [],
  aperturas: [],
  diaAbiertoActual: null,
};

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

async function loadDb(): Promise<LocalDb> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultDb };
  const parsed = JSON.parse(saved);
  const mergedCanchas = (parsed.canchas || defaultDb.canchas).slice();
  defaultDb.canchas.forEach((base) => {
    if (!mergedCanchas.some((c: CanchaEstado) => c.id === base.id)) {
      mergedCanchas.push(base);
    }
  });
  return {
    ...defaultDb,
    ...parsed,
    canchas: mergedCanchas,
    torneos: parsed.torneos || [],
    arbitros: parsed.arbitros || [],
    partidos: parsed.partidos || [],
    reservas: parsed.reservas || [],
    caja: parsed.caja || [],
    cierres: parsed.cierres || [],
    aperturas: parsed.aperturas || [],
    diaAbiertoActual: parsed.diaAbiertoActual || null,
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
  payload: {
    cancha: string;
    cliente: string;
    fecha: string;
    horaInicio: string;
    horaFin?: string;
    monto?: number;
    referencia?: string;
    marcarOcupada?: boolean;
  },
) {
  const db = await loadDb();
  const cancha = db.canchas.find((c) => c.nombre === payload.cancha || c.id === payload.cancha);
  if (!cancha) throw new Error('Cancha no encontrada');

  const marcarOcupada = payload.marcarOcupada !== false;
  if (marcarOcupada) {
    if (!db.diaAbiertoActual || db.diaAbiertoActual !== payload.fecha) {
      throw new Error('Debes abrir el día desde Ajustes antes de ocupar una cancha.');
    }
    cancha.estado = 'Ocupada';
    cancha.alquiler = { hora: payload.horaInicio, cliente: payload.cliente, fecha: payload.fecha };
  }

  const nuevaReserva: Reserva = {
    id: generateId('reserva'),
    canchaId: cancha.id,
    cancha: cancha.nombre,
    cliente: payload.cliente,
    fecha: payload.fecha,
    horaInicio: payload.horaInicio,
  };

  db.reservas = [nuevaReserva, ...db.reservas.filter((r) => !(r.canchaId === cancha.id && r.fecha === payload.fecha))];
  await saveDb(db);
  return marcarOcupada ? cancha : nuevaReserva;
}

export async function liberarCancha(_: string, canchaId: string) {
  const db = await loadDb();
  const cancha = db.canchas.find((c) => c.id === canchaId);
  if (!cancha) throw new Error('Cancha no encontrada');
  const fechaAlquiler = cancha.alquiler?.fecha;
  cancha.estado = 'Libre';
  cancha.alquiler = null;
  if (fechaAlquiler) {
    db.reservas = db.reservas.filter((r) => !(r.canchaId === canchaId && r.fecha === fechaAlquiler));
  }
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
  const fechaReserva = cancha.alquiler.fecha;
  const idxReserva = db.reservas.findIndex((r) => r.canchaId === canchaId && r.fecha === fechaReserva);
  if (idxReserva !== -1) {
    db.reservas[idxReserva] = {
      ...db.reservas[idxReserva],
      cliente: payload.cliente ?? db.reservas[idxReserva].cliente,
      horaInicio: payload.hora ?? db.reservas[idxReserva].horaInicio,
      fecha: payload.fecha ?? db.reservas[idxReserva].fecha,
    };
  }
  await saveDb(db);
  return cancha;
}

export async function movimientosCaja(_: string, fecha?: string) {
  const db = await loadDb();
  const hoy = fecha || new Date().toISOString().slice(0, 10);
  const diaConsulta = db.diaAbiertoActual || hoy;
  const movimientosDia = db.caja.filter((m) => (m.fecha || '').slice(0, 10) === diaConsulta);
  const cerrado = db.cierres.some((c) => c.fecha === diaConsulta);
  const abierto = db.diaAbiertoActual === diaConsulta;
  return { movimientos: movimientosDia, cerrado, abierto, diaConsulta };
}

export async function registrarRenta(
  _: string,
  payload: { monto: number; referencia?: string; concepto: string; tipo: Movimiento['tipo']; detalle?: Record<string, any>; fecha?: string },
) {
  const db = await loadDb();
  if (!db.diaAbiertoActual) {
    throw new Error('Debes abrir el día desde Ajustes para registrar ventas.');
  }
  const fechaMovimiento = payload.fecha || new Date().toISOString();
  const fechaForzada = `${db.diaAbiertoActual}T${new Date(fechaMovimiento).toISOString().slice(11)}`;
  const movimiento: Movimiento = {
    id: generateId('mov'),
    concepto: payload.concepto,
    tipo: payload.tipo,
    monto: Number(Number(payload.monto).toFixed(2)),
    fecha: fechaForzada,
    detalle: payload.detalle,
  };
  db.caja = [movimiento, ...db.caja];
  await saveDb(db);
  return movimiento;
}

export async function calendarioDia(_: string, fecha: string) {
  const db = await loadDb();
  const reservasRegistradas = db.reservas
    .filter((r) => r.fecha === fecha)
    .map((r) => ({
      id: r.id,
      tipo: 'reserva',
      cliente: r.cliente,
      horaInicio: r.horaInicio,
      cancha: r.cancha,
    }));
  const reservasActivas = db.canchas
    .filter((c) => c.alquiler && c.alquiler.fecha === fecha)
    .map((c) => ({
      id: c.id,
      tipo: 'reserva',
      cliente: c.alquiler?.cliente,
      horaInicio: c.alquiler?.hora,
      cancha: c.nombre,
    }))
    .filter(
      (res) => !reservasRegistradas.some((registrada) => registrada.cancha === res.cancha && registrada.horaInicio === res.horaInicio),
    );
  const reservas = [...reservasRegistradas, ...reservasActivas];
  const partidos = db.partidos.filter((p) => p.fecha?.slice(0, 10) === fecha).map((p) => ({ ...p, tipo: 'partido' }));
  const torneos = db.torneos
    .filter((t) => t.fecha === fecha)
    .map((t) => ({ id: t.id, tipo: 'torneo', nombre: t.nombre, horaInicio: t.fecha, canchas: t.canchas }));
  return { reservas, partidos, torneos };
}

export async function obtenerDiaAbiertoActual() {
  const db = await loadDb();
  return { diaAbiertoActual: db.diaAbiertoActual, aperturas: db.aperturas };
}

export async function reporteMensual(_: string, anio: number, mes: number) {
  const db = await loadDb();
  const mesStr = String(mes).padStart(2, '0');
  const movimientosEnCaja = db.caja.filter((m) => (m.fecha || '').startsWith(`${anio}-${mesStr}`) && m.tipo !== 'pago_arbitro');
  const cierresMes = db.cierres.filter((c) => c.fecha.startsWith(`${anio}-${mesStr}`));

  const ingresos =
    movimientosEnCaja.filter((m) => m.monto > 0).reduce((acc, m) => acc + m.monto, 0) +
    cierresMes.reduce((acc, c) => acc + c.ingresos, 0);
  const egresos =
    movimientosEnCaja.filter((m) => m.monto < 0).reduce((acc, m) => acc + Math.abs(m.monto), 0) +
    cierresMes.reduce((acc, c) => acc + c.egresos, 0);

  const detalleMovimientos = [
    ...movimientosEnCaja.map((m) => ({
      ...m,
      fechaLegible: new Date(m.fecha).toLocaleString('es-ES', { hour12: false }),
    })),
    ...cierresMes.map((cierre) => ({
      id: `cierre-${cierre.fecha}`,
      concepto: `Cierre del ${cierre.fecha}`,
      tipo: 'manual',
      monto: cierre.total,
      fecha: `${cierre.fecha}T23:59:00`,
      fechaLegible: new Date(`${cierre.fecha}T23:59:00`).toLocaleString('es-ES', { hour12: false }),
    } as Movimiento & { fechaLegible: string })),
  ];

  const saldoNeto = ingresos - egresos;
  return { ingresos: ingresos.toFixed(2), egresos: egresos.toFixed(2), saldoNeto: saldoNeto.toFixed(2), detalleMovimientos };
}

export async function cerrarDia(_: string, fecha?: string, password?: string) {
  const db = await loadDb();
  const hoy = fecha || new Date().toISOString().slice(0, 10);
  if (password && password !== USERS.propietario.password) {
    throw new Error('Contraseña incorrecta');
  }
  const movimientosDia = db.caja.filter((m) => (m.fecha || '').slice(0, 10) === hoy);
  const ingresos = movimientosDia.filter((m) => m.monto > 0).reduce((acc, m) => acc + m.monto, 0);
  const egresos = movimientosDia.filter((m) => m.monto < 0).reduce((acc, m) => acc + Math.abs(m.monto), 0);
  const total = ingresos - egresos;
  const resumen: Cierre = { fecha: hoy, total, movimientos: movimientosDia, ingresos, egresos };
  db.cierres = db.cierres.filter((c) => c.fecha !== hoy);
  db.cierres.push(resumen);
  db.caja = db.caja.filter((m) => (m.fecha || '').slice(0, 10) !== hoy);
  db.aperturas = db.aperturas.filter((dia) => dia !== hoy);
  db.diaAbiertoActual = null;
  await saveDb(db);
  return {
    message: 'Cierre completado',
    total,
    ingresos,
    egresos,
    movimientos: movimientosDia,
  };
}

export async function abrirDia(_: string, fecha: string, password?: string) {
  const db = await loadDb();
  if (password && password !== USERS.propietario.password) {
    throw new Error('Contraseña incorrecta');
  }
  const dia = fecha.slice(0, 10);
  db.cierres = db.cierres.filter((c) => c.fecha !== dia);
  db.aperturas = [dia];
  db.diaAbiertoActual = dia;
  await saveDb(db);
  return { message: 'Día abierto correctamente', fecha: dia };
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
