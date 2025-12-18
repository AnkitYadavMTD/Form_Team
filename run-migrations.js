const fs = require('fs');
const path = require('path');
const pool = require('./backend/db');

async function runMigrations() {
  try {
    const sqlPath = path.join(__dirname, 'backend', 'migrations.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    // Split statements by semicolon followed by line break
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
        console.log('Executed statement');
      } catch (err) {
        console.error('Statement failed:', err.message);
      }
    }

    console.log('Migrations complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration runner failed:', err.message);
    process.exit(1);
  }
}

runMigrations();
