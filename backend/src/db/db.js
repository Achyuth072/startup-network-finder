import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../..', '.env') });

// Create a new Pool instance for PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL configuration if needed for production
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

// Export the pool as a named export
export { pool };