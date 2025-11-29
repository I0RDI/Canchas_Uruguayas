# Resumen Sprint 7

## Endpoints nuevos o modificados
- `POST /login`: valida usuario/contraseña en base local y devuelve token + rol.
- `GET /torneos`, `POST /torneos`, `PUT /torneos/:id`, `DELETE /torneos/:id`: CRUD de torneos con bitácora en creación.
- `GET /arbitros`, `POST /arbitros`, `PUT /arbitros/:id`, `DELETE /arbitros/:id`: CRUD de árbitros.
- `POST /partidos`: crea partido de prueba asociado a árbitro.
- `POST /partidos/:id/pago-arbitro`: genera pago de $240 MXN para el árbitro y lo registra en caja + bitácora.
- `POST /caja/renta`: registra renta de cancha (ingreso) y escribe en bitácora de reserva.
- `GET /caja`: lista movimientos de caja del día.
- `GET /bitacora`: consulta de las últimas acciones relevantes.

## Tablas / archivos de datos
- `backend/data.json`: almacena usuarios con rol, torneos, árbitros, caja, partidos y bitácora.

## Pantallas / componentes modificados
- `App.tsx`: protege navegación por sesión y agrega tabs de Árbitros y Caja.
- `src/screens/LoginScreen.tsx`: login real contra API con persistencia.
- `src/screens/TorneosScreen.tsx`: conecta CRUD con API.
- `src/screens/CanchasScreen.tsx`: registra renta en caja al guardar reserva.
- Nuevas: `src/screens/ArbitrosScreen.tsx` y `src/screens/CajaScreen.tsx`.
- Nuevos helpers: `src/context/AuthContext.tsx` (sesión global) y `src/services/api.ts` (cliente HTTP).
- Backend mínimo: `backend/server.js` (Express) + `backend/package.json`.

## Cómo probar
1. **Backend**: en `/backend`, ejecutar `npm install` (si hay conexión) y luego `npm start` para levantar API en `http://localhost:4000`. Si usas dispositivo físico en Expo Go, exporta `EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000` antes de `npm start` del frontend.
2. **Login + roles**: en la app, usar `propietario@club.com` / `admin123` o `empleado@club.com` / `empleado123`. Tras iniciar sesión se desbloquean las tabs.
3. **CRUD torneos y árbitros**: en sus pantallas, crear/editar/eliminar elementos; se consumen los endpoints protegidos con token.
4. **Pagos de árbitros y caja**: crear un partido vía `POST /partidos` (seeds de árbitros) y luego `POST /partidos/:id/pago-arbitro`; en la pantalla de caja se listan los movimientos del día. Registrar reservas en Canchas también agrega ingreso de renta.
5. **Bitácora**: consultar `GET /bitacora` para ver eventos de login, creación de torneos, rentas y pagos de árbitros.

## Error encontrado y solución aplicada
- **Síntoma**: al intentar iniciar sesión desde un dispositivo físico (Expo Go) la app no podía llegar al backend porque construía la URL con `localhost` o `10.0.2.2`, que solo funcionan en emuladores o en la máquina de desarrollo.
- **Diagnóstico**: el frontend no detectaba correctamente el host de la sesión de Expo ni respetaba una URL configurada, por lo que al desplegarse en un móvil real apuntaba a un servidor inexistente.
- **Corrección**: se implementó detección dinámica del host (IP de la LAN al usar Expo, hosts especiales de emuladores y respaldo a `EXPO_PUBLIC_API_URL`) en el cliente HTTP y en `App.tsx`, de modo que la base URL del backend se resuelva automáticamente según el entorno. Si se quiere forzar un host específico, puede definirse `EXPO_PUBLIC_API_URL` antes de arrancar el bundler de Expo.
