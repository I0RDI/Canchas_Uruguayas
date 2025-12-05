# Sprint 6 - Login con roles, torneos y árbitros

## Endpoints implementados/ajustados
- `POST /login`: valida credenciales, devuelve token JWT y datos del usuario (id, nombre, rol, email).
- `GET /torneos` | `POST /torneos` | `PUT /torneos/:id` | `DELETE /torneos/:id`: CRUD de torneos con soft delete.
- `GET /arbitros` | `POST /arbitros` | `PUT /arbitros/:id` | `DELETE /arbitros/:id`: CRUD de árbitros con soft delete.

## Cambios en la base de datos (data.json)
- Usuarios incluyen campo `rol` con valores `propietario`, `empleado1`, `empleado2`.
- Se añadió usuario de ejemplo para el rol `empleado2` (`torneos@club.com` / `empleado123`).
- Torneos y árbitros manejan el campo `activo` para eliminaciones lógicas.

## Pantallas modificadas en frontend
- **App.tsx**: navegación condicional por rol (propietario, empleado1, empleado2) y selección dinámica de pestañas.
- **AuthContext**: persistencia y restauración de sesión con AsyncStorage; compatibilidad con la respuesta del login real.
- **Servicios API**: manejo de errores del backend y URL base alineada con el backend local.

## Pasos para probar
1. Levantar backend: `cd backend && npm start` (puerto 4000).
2. Expo app apunta a `http://192.168.50.86:4000` (configurable con `EXPO_PUBLIC_API_URL`).
3. Login con:
   - `propietario@club.com` / `admin123` (acceso total).
   - `empleado@club.com` / `empleado123` (canchas, calendario/reservas, caja).
   - `torneos@club.com` / `empleado123` (torneos y árbitros).
4. Verificar que cada rol solo ve sus pestañas correspondientes.
5. En pestañas de Torneos y Árbitros: crear, editar y eliminar elementos; refrescar lista para confirmar persistencia.
