# Resumen Sprint 7

## Endpoints nuevos o modificados
- `POST /partidos`: creación de partido de prueba con árbitro, torneo opcional y fecha.
- `POST /partidos/:id/pago-arbitro`: valida partido, registra pago en caja ($240) y marca el partido como pagado.
- `POST /caja/renta`: registra movimiento de renta de cancha con monto variable y referencia opcional.
- `GET /caja?fecha=YYYY-MM-DD`: lista movimientos de caja del día (rentas y pagos a árbitros).
- `GET /bitacora`: devuelve los registros más recientes de la bitácora.

## Tablas nuevas o modificadas
- `partidos`: ahora guarda `arbitroId`, `torneoId`, `fecha`, `pagado` y `pagoId`.
- `caja`: movimientos con `concepto`, `tipo` (renta/pago_arbitro), `monto`, `fecha_hora`, `usuario_id`, `referencia` y referencias a partido/torneo/árbitro.
- `bitacora`: registra acciones con `usuario_id`, `accion`, `entidad`, `id_entidad`, `detalle` y `fecha_hora`.

## Pasos breves para probar
1. **Login** con un usuario existente para obtener token (debe registrarse en bitácora).
2. **Registrar renta de cancha** con `POST /caja/renta` o desde la pantalla de Caja; verificar movimiento en `GET /caja`.
3. **Crear partido** con `POST /partidos` o desde la pantalla de Árbitros; se valida árbitro/torneo.
4. **Pagar árbitro** con `POST /partidos/:id/pago-arbitro` (botón en pantalla de Árbitros). Debe crear movimiento en caja y marcar partido como pagado.
5. **Consultar movimientos de caja** del día con `GET /caja` o vista de Caja en la app.
6. **Revisar bitácora** con `GET /bitacora` para confirmar registros de login, creación de torneo, creación de partido, renta y pago a árbitro.
