import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDefaultApiUrl() {
  // Prefer explicit env so QA/producción puedan configurarlo.
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Emuladores locales: usar 10.0.2.2 (Android) o localhost (web/iOS simulator).
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
    if (Platform.OS === 'web' || Platform.OS === 'ios') return 'http://localhost:4000';
  }

  // Dispositivos físicos en Expo Go: tomar la IP del host del bundler.
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:4000`;
  }

  // Último recurso.
  return 'http://localhost:4000';
}

const API_URL = getDefaultApiUrl();

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Error de servidor');
  }
  return res.json();
}

export async function login(email: string, password: string) {
  return request('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function obtenerTorneos(token: string) {
  return request('/torneos', { headers: { Authorization: `Bearer ${token}` } });
}

export async function crearTorneo(token: string, payload: { nombre: string; fecha: string; canchas: string[] }) {
  return request('/torneos', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function actualizarTorneo(token: string, id: string, payload: Partial<{ nombre: string; fecha: string; canchas: string[] }>) {
  return request(`/torneos/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function eliminarTorneo(token: string, id: string) {
  return request(`/torneos/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

export async function obtenerArbitros(token: string) {
  return request('/arbitros', { headers: { Authorization: `Bearer ${token}` } });
}

export async function crearArbitro(token: string, payload: { nombre: string; telefono?: string }) {
  return request('/arbitros', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function actualizarArbitro(token: string, id: string, payload: Partial<{ nombre: string; telefono: string; activo: boolean }>) {
  return request(`/arbitros/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function eliminarArbitro(token: string, id: string) {
  return request(`/arbitros/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

export async function crearPartido(token: string, payload: { arbitroId: string; torneoId?: string; fecha?: string }) {
  return request('/partidos', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function pagarArbitro(token: string, partidoId: string) {
  return request(`/partidos/${partidoId}/pago-arbitro`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}

export async function registrarRenta(token: string, payload: { monto: number; referencia?: string }) {
  return request('/caja/renta', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export async function movimientosCaja(token: string, fecha?: string) {
  const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : '';
  return request(`/caja${query}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function bitacora(token: string) {
  return request('/bitacora', { headers: { Authorization: `Bearer ${token}` } });
}
