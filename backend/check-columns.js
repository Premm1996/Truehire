const mysql = require('mysql2/promise');
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

async function checkColumns() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL database connection successful!');

        const [rows] = await connection.execute('DESCRIBE attendance_breaks');
        console.log('attendance_breaks columns:');
        rows.forEach(r => console.log(`${r.Field} - ${r.Type}`));

        // Also check if break_start_time exists
        try {
            const [test] = await connection.execute('SELECT break_start_time FROM attendance_breaks LIMIT 1');
            console.log('break_start_time column exists');
        } catch (error) {
            console.log('break_start_time column does NOT exist');
        }

        // Check if break_start exists
        try {
            const [test] = await connection.execute('SELECT break_start FROM attendance_breaks LIMIT 1');
            console.log('break_start column exists');
        } catch (error) {
            console.log('break_start column does NOT exist');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkColumns();
