const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runAttendanceMigrations() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'hireconnect',
    password: process.env.DB_PASSWORD || 'Tbdam@583225',
    database: process.env.DB_NAME || 'hireconnect_portal',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  const migrations = [
    'create-attendance-tables.sql',
    'alter-attendance-breaks-table.sql',
    'add-attendance-indexes.sql'
  ];

  try {
    for (const migration of migrations) {
      console.log(`Running migration: ${migration}`);
      const sql = fs.readFileSync(path.join(__dirname, 'migrations', migration), 'utf8');
      const [result] = await pool.execute(sql);
      console.log(`✅ ${migration} executed successfully`);
    }
    console.log('All attendance migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runAttendanceMigrations();
