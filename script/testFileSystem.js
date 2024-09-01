import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utilidades para obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/data/users.json');

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
  console.log('Created file at:', filePath);
} else {
  console.log('File already exists at:', filePath);
}

const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
users.push({ _id: 'test-id', name: 'Test User' });
fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
console.log('User written to file:', { _id: 'test-id', name: 'Test User' });
