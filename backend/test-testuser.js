// Test script for the new testuser
console.log('Testing connection with testuser...');

const mysql = require('mysql2/promise');

// Create connection pool with the test user credentials
const pool = mysql.createPool({
  host: 'localhost',
  user: 'testuser',
  password: 'StrongPass123!',
  database: 'hireconnect_portal',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connection successful with testuser');
    
    // Test a simple query
    const [result] = await conn.query('SELECT 1 as test');
    console.log('✅ Query test successful:', result[0]);
    
    // Check database info
    const [dbInfo] = await conn.query('SELECT DATABASE() as db, USER() as user');
    console.log('📊 Database:', dbInfo[0].db);
    console.log('👤 User:', dbInfo[0].user);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    console.log('Error code:', err.code);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
