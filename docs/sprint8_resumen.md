# Sprint 8 - Resumen de cambios

## Endpoints nuevos o modificados
- `GET /reservas?fecha=YYYY-MM-DD`: obtiene reservas del día.
- `POST /reservas`: registra una reserva y opcionalmente su movimiento de caja.
- `GET /calendario?fecha=YYYY-MM-DD`: consolida reservas, partidos y torneos del día.
- `GET /caja?fecha=YYYY-MM-DD`: ahora devuelve estado de cierre y movimientos del día.
- `POST /caja/cerrar-dia`: cierra los movimientos del día seleccionado.
- `GET /reportes/mensual?anio=YYYY&mes=MM`: reporte mensual de ingresos/egresos.

## Scripts agregados
- `npm run backup:db` (en `backend/`): genera respaldo de `data.json` en `backend/backups/`.

## Cambios en interfaz
- **Calendario**: muestra eventos reales por fecha y permite navegar por meses/días.
- **Ajustes**: consulta de reporte mensual y acción real de cierre de día.
- **Caja**: indica cuando el día está cerrado e impide nuevas capturas.

## Instrucciones rápidas de prueba
- **Calendario**: crea una reserva desde Canchas o Caja y verifica que aparezca en la fecha correspondiente en la pestaña Calendario.
- **Reporte mensual**: en Ajustes, selecciona mes y año y pulsa "Consultar" para ver totales y movimientos.
- **Cierre de día**: en Ajustes pulsa "Cerrar día" y verifica que en Caja ya no permita registrar movimientos.
- **Respaldo**: en `backend/` ejecuta `npm run backup:db` y confirma que se genere un archivo en `backend/backups/`.
