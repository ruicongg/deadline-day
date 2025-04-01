// This helper file loads environment variables
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load environment variables from .env file
config({ path: join(__dirname, '..', '.env') });

// Verify DATABASE_URL is loaded
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  console.error('WARNING: DATABASE_URL is not defined in your environment');
}

export default process.env;