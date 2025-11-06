const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { loadEnvironment } = require('./config/envLoader');
loadEnvironment();

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = {
  host: isProduction ? (process.env.DB_HOST || process.env.RDS_HOSTNAME || 'localhost') : 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hireconnect_portal',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: isProduction ? 20 : 10,
  queueLimit: 0,
  ssl: isProduction ? {
    rejectUnauthorized: false,
  } : false,
  connectTimeout: 60000,
  multipleStatements: true
};

async function runMigration() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL database connection successful!');

        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', 'fix-attendance-breaks-column-names.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Split into individual statements
        const statements = migrationSQL.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            if (statement.startsWith('--')) continue; // Skip comments
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await connection.execute(statement);
        }

        console.log('✅ Migration completed successfully!');

        // Check columns after migration
        const [rows] = await connection.execute('DESCRIBE attendance_breaks');
        console.log('attendance_breaks columns after migration:');
        rows.forEach(r => console.log(`${r.Field} - ${r.Type}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();
