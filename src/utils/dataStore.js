import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Simple JSON file-based storage
 */
export class DataStore {
  constructor(filename) {
    this.filepath = path.join(DATA_DIR, filename);
  }

  /**
   * Read data from file
   */
  async read() {
    try {
      const data = await fs.readFile(this.filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Write data to file
   */
  async write(data) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(this.filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Clear all data
   */
  async clear() {
    await this.write([]);
  }
}
