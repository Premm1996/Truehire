// PowerShell-compatible database connection test
console.log('Testing database connection...');

const mysql = require('mysql2/promise');

// Create connection pool with the specified credentials
const pool = mysql.createPool({
  host: 'localhost',
  user: 'hireconnect',
  password: 'Tbdam@583225',
  database: 'hireconnect_portal',
  port: 3306, // Default MySQL port
  // For MySQL 8.0+ with caching_sha2_password, we need to enable SSL
  ssl: {
    rejectUnauthorized: false
  },
  // Enable insecure auth for older clients
  insecureAuth: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connection successful');
    
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
    console.log('💡 Troubleshooting tips:');
    console.log('1. Check if MySQL server is running');
    console.log('2. Verify the user "hireconnect" exists and has permissions');
    console.log('3. Check if database "hireconnect_portal" exists');
    console.log('4. Verify the password is correct');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
