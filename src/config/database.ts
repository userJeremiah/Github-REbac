import dotenv from 'dotenv';
dotenv.config();

// Use SQLite by default (no installation needed!)
// To use PostgreSQL, set USE_POSTGRES=true in .env
const usePostgres = process.env.USE_POSTGRES === 'true';

let pool: any;
let testDatabaseConnection: () => Promise<void>;
let initializeDatabase: (() => void) | undefined;

if (usePostgres) {
  // PostgreSQL
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  testDatabaseConnection = async () => {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected:', result.rows[0].now);
    } catch (error: any) {
      console.error('⚠️  PostgreSQL connection failed:', error.message);
      console.log('💡 Falling back to SQLite...');
      // Fall back to SQLite
      const sqlite = require('./database-sqlite');
      pool = sqlite.pool;
      initializeDatabase = sqlite.initializeDatabase;
      if (initializeDatabase) initializeDatabase();
      await sqlite.testDatabaseConnection();
    }
  };
} else {
  // SQLite (default - no installation needed!)
  const sqlite = require('./database-sqlite');
  pool = sqlite.pool;
  testDatabaseConnection = sqlite.testDatabaseConnection;
  initializeDatabase = sqlite.initializeDatabase;
}

export { pool, testDatabaseConnection, initializeDatabase };
