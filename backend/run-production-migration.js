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

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = [
    'add-employee-approval-field.sql',
    'add-employee-profile-fields.sql',
    'fix-role-enum.sql',
    'create-tax-declarations-table.sql',
    'create-payroll-history-table.sql',
    // Add other pending migrations as needed
  ];

  try {
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`🚀 Running migration: ${file}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          const [result] = await pool.execute(sql);
          console.log(`✅ Migration ${file} executed successfully`);
          console.log('Rows affected:', result.affectedRows || 'N/A');
        } catch (error) {
          console.error(`❌ Migration ${file} failed:`, error.message);
          if (error.code === 'ER_DUP_COL_NAME' || error.code === 'ER_BAD_FIELD_ERROR' || error.message.includes('already exists') || error.message.includes('Duplicate column name')) {
            console.log(`ℹ️  Migration ${file} already applied or no changes needed.`);
          } else {
            throw error; // Re-throw if not a duplicate error
          }
        }
      } else {
        console.log(`⚠️  Migration file not found: ${file}`);
      }
    }
    console.log('🎉 All migrations completed!');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
