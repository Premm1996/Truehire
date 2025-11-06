const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Tbdam@583225',
    database: process.env.DB_NAME || 'hireconnect_portal',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'run-new-tables.sql'), 'utf8');
    const [result] = await pool.execute(sql);
    console.log('✅ New tables migration executed successfully');
    console.log('Rows affected:', result.affectedRows || 'N/A');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
