const mysql = require('mysql2/promise');
const dbConfig = require('./db-fixed.js');

async function testCandidateRole() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL database connection successful!');

        // Try to insert a user with role 'candidate'
        const insertQuery = `
            INSERT INTO users (fullName, email, password, mobile, role, is_admin, termsAgreed, isVerified)
            VALUES ('Test Candidate', 'candidate@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890', 'candidate', FALSE, TRUE, TRUE)
        `;

        await connection.execute(insertQuery);
        console.log('✅ Successfully inserted user with role "candidate"');

        // Verify the user was inserted
        const [rows] = await connection.execute('SELECT id, fullName, email, role FROM users WHERE email = ?', ['candidate@test.com']);
        if (rows.length > 0) {
            console.log('✅ User found:', rows[0]);
        }

        // Clean up
        await connection.execute('DELETE FROM users WHERE email = ?', ['candidate@test.com']);
        console.log('✅ Test user cleaned up');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testCandidateRole();
