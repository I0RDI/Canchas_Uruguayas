# Respaldo básico de la base de datos

## Cómo ejecutarlo
1. Posicionarse en la carpeta `backend/`.
2. Ejecutar el comando:
   ```bash
   npm run backup:db
   ```
   Esto genera una copia del archivo `data.json` usado por la API.

## Dónde se guardan los archivos
Los respaldos se almacenan en `backend/backups/` con un nombre con fecha y hora, por ejemplo:
```
backend/backups/backup_20250101_2359.json
```

## Frecuencia recomendada
Realizar el respaldo al menos una vez por semana y antes de aplicar cambios importantes al sistema.
