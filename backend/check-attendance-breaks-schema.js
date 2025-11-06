const mysql = require('mysql2/promise');
const dbConfig = require('./db-fixed.js');

async function checkSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL database connection successful!');

        const [rows] = await connection.execute('DESCRIBE attendance_breaks');
        console.log('attendance_breaks columns:');
        rows.forEach(r => console.log(`${r.Field} - ${r.Type}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkSchema();
