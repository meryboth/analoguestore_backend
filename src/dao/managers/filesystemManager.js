import fs from 'fs';
import path from 'path';
import config from '../../config/config.js';
import { fileURLToPath } from 'url';

// Utilidades para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileSystemManager {
  constructor(basePath) {
    this.basePath = path.resolve(__dirname, '../../../', basePath); // Asegurar que la ruta es relativa al proyecto raíz
    this._ensureBasePathExists();
  }

  _ensureBasePathExists() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
      console.log('Created base directory:', this.basePath); // Depuración
    }
  }

  _getPath(filePath) {
    return path.join(this.basePath, filePath);
  }

  async readFile(filePath) {
    try {
      const fullPath = this._getPath(filePath);
      if (!fs.existsSync(fullPath)) {
        await this.writeFile(filePath, []); // Crear archivo vacío si no existe
      }
      const data = await fs.promises.readFile(fullPath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('File read error:', err);
      return null;
    }
  }

  async writeFile(filePath, data) {
    try {
      const fullPath = this._getPath(filePath);
      await fs.promises.writeFile(
        fullPath,
        JSON.stringify(data, null, 2),
        'utf-8'
      );
      console.log('File written at:', fullPath); // Depuración
    } catch (err) {
      console.error('File write error:', err);
    }
  }

  async deleteFile(filePath) {
    try {
      const fullPath = this._getPath(filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        console.log('File deleted at:', fullPath); // Depuración
      }
    } catch (err) {
      console.error('File delete error:', err);
    }
  }
}

export default new FileSystemManager(config.filesystem_path);
