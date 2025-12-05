import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', 'data.json');
const backupsDir = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace('T', '_')
  .split('.')[0];

const target = path.join(backupsDir, `backup_${timestamp}.json`);

fs.copyFileSync(dataPath, target);
console.log(`Respaldo generado: ${target}`);
