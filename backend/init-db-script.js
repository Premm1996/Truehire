const fs = require('fs');
const path = require('path');
const pool = require('./db-fixed');

async function initDatabase() {
  try {
    console.log('🔄 Initializing HireConnect Portal database...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'init-db-fixed.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL script
    await pool.query(sql);

    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase();
