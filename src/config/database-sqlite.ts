import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../github_rebac.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Pool-like interface to match PostgreSQL
export const pool = {
  async query(sql: string, params: any[] = []) {
    try {
      // Convert PostgreSQL $1, $2 placeholders to SQLite ? placeholders
      let sqliteSql = sql;
      if (sql.includes('$')) {
        // Replace $1, $2, $3, etc. with ?
        sqliteSql = sql.replace(/\$\d+/g, '?');
      }
      
      // Remove RETURNING clause for SQLite (not supported)
      const hasReturning = sqliteSql.toUpperCase().includes('RETURNING');
      if (hasReturning) {
        sqliteSql = sqliteSql.replace(/RETURNING\s+\*/gi, '');
      }
      
      if (sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().startsWith('WITH')) {
        const stmt = db.prepare(sqliteSql);
        const rows = stmt.all(...params);
        return { rows };
      } else {
        const stmt = db.prepare(sqliteSql);
        const info = stmt.run(...params);
        
        // For INSERT, fetch the inserted row
        if (hasReturning || sqliteSql.toUpperCase().startsWith('INSERT')) {
          const lastId = info.lastInsertRowid;
          const tableName = sqliteSql.match(/INSERT INTO (\w+)/i)?.[1];
          if (tableName && lastId) {
            const selectStmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
            const row = selectStmt.get(lastId);
            return { rows: [row] };
          }
        }
        
        return { rows: [], rowCount: info.changes };
      }
    } catch (error: any) {
      console.error('SQLite query error:', error.message);
      throw error;
    }
  },
  
  async connect() {
    return {
      query: this.query.bind(this),
      release: () => {}
    };
  }
};

export async function testDatabaseConnection() {
  try {
    const result = db.prepare("SELECT datetime('now') as now").get();
    console.log('✅ SQLite database connected:', result);
  } catch (error: any) {
    console.error('⚠️  Database connection failed:', error.message);
  }
}

export function initializeDatabase() {
  console.log('📊 Initializing SQLite database...');
  
  // Read and execute migrations
  const fs = require('fs');
  const migrations = [
    '001_initial_schema.sql',
    '002_teams.sql',
    '003_pull_requests.sql',
    '004_audit_logs.sql'
  ];
  
  for (const migration of migrations) {
    try {
      const migrationPath = path.join(__dirname, '../../migrations', migration);
      if (fs.existsSync(migrationPath)) {
        let sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Convert PostgreSQL syntax to SQLite
        sql = sql
          .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
          .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
          .replace(/TIMESTAMP/gi, 'DATETIME')
          .replace(/DEFAULT NOW\(\)/gi, "DEFAULT (datetime('now'))")
          .replace(/IF NOT EXISTS/gi, 'IF NOT EXISTS')
          .replace(/CREATE INDEX IF NOT EXISTS/gi, 'CREATE INDEX IF NOT EXISTS');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter((s: string) => s.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              db.exec(statement);
            } catch (err: any) {
              // Ignore "table already exists" errors
              if (!err.message.includes('already exists')) {
                console.error(`Error in ${migration}:`, err.message);
              }
            }
          }
        }
        
        console.log(`  ✅ ${migration} completed`);
      }
    } catch (error: any) {
      console.error(`  ⚠️  ${migration} failed:`, error.message);
    }
  }
  
  console.log('✅ Database initialized');
}
