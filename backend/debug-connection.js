// Debug script to test MySQL connection
console.log('Debugging MySQL connection...');

const mysql = require('mysql2/promise');

// Test with different connection configurations
const configs = [
  {
    name: 'Default config',
    host: 'localhost',
    user: 'hireconnect',
    password: 'Tbdam@583225',
    database: 'hireconnect_portal',
    port: 3306
  },
  {
    name: 'Without database',
    host: 'localhost',
    user: 'hireconnect',
    password: 'Tbdam@583225',
    port: 3306
  },
  {
    name: 'Test with root user',
    host: 'localhost',
    user: 'root',
    password: 'Tbdam@583225', // Using the same password for testing
    port: 3306
  }
];

async function testConnection(config) {
  console.log(`\nTesting: ${config.name}`);
  try {
    const pool = mysql.createPool(config);
    const conn = await pool.getConnection();
    console.log('✅ Connection successful');
    
    if (config.database) {
      const [result] = await conn.query('SELECT 1 as test');
      console.log('✅ Query test successful:', result[0]);
    }
    
    conn.release();
    await pool.end();
    return true;
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    console.log('Error code:', err.code);
    return false;
  }
}

async function runTests() {
  for (const config of configs) {
    await testConnection(config);
  }
}

runTests();
