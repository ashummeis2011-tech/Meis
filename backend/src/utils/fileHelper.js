import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Delete file if it exists
export const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    // File doesn't exist or already deleted
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
};

// Ensure directory exists
export const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};
