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

async function testMigration() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL database connection successful!');

        // Test the ALTER TABLE commands one by one
        console.log('Testing column renames...');

        // Check current columns
        const [rows] = await connection.execute('DESCRIBE attendance_breaks');
        console.log('Current columns:');
        rows.forEach(r => console.log(`${r.Field} - ${r.Type}`));

        // Try to rename break_start to break_start_time
        try {
            await connection.execute('ALTER TABLE attendance_breaks CHANGE COLUMN break_start break_start_time DATETIME NOT NULL');
            console.log('✅ Renamed break_start to break_start_time');
        } catch (error) {
            console.log('❌ Failed to rename break_start:', error.message);
        }

        // Try to rename break_end to break_end_time
        try {
            await connection.execute('ALTER TABLE attendance_breaks CHANGE COLUMN break_end break_end_time DATETIME');
            console.log('✅ Renamed break_end to break_end_time');
        } catch (error) {
            console.log('❌ Failed to rename break_end:', error.message);
        }

        // Try to rename reason to break_reason
        try {
            await connection.execute('ALTER TABLE attendance_breaks CHANGE COLUMN reason break_reason TEXT');
            console.log('✅ Renamed reason to break_reason');
        } catch (error) {
            console.log('❌ Failed to rename reason:', error.message);
        }

        // Try to add break_note
        try {
            await connection.execute('ALTER TABLE attendance_breaks ADD COLUMN break_note TEXT AFTER break_reason');
            console.log('✅ Added break_note column');
        } catch (error) {
            console.log('❌ Failed to add break_note:', error.message);
        }

        // Try to rename attendance_id to attendance_record_id
        try {
            await connection.execute('ALTER TABLE attendance_breaks CHANGE COLUMN attendance_id attendance_record_id INT NOT NULL');
            console.log('✅ Renamed attendance_id to attendance_record_id');
        } catch (error) {
            console.log('❌ Failed to rename attendance_id:', error.message);
        }

        // Check final columns
        const [finalRows] = await connection.execute('DESCRIBE attendance_breaks');
        console.log('Final columns:');
        finalRows.forEach(r => console.log(`${r.Field} - ${r.Type}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testMigration();
