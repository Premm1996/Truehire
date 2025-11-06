// Simple database connection test
const db = require('./db');

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        await db.testConnection();
        console.log('✅ Database connection test completed successfully!');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('💡 Please check:');
        console.error('1. MySQL server is running');
        console.error('2. .env file exists with correct credentials');
        console.error('3. Database "student_portal" exists');
    }
}

testDatabaseConnection();
