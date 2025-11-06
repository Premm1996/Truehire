// Simple connection test with minimal configuration
console.log('Testing simple MySQL connection...');

const mysql = require('mysql2');

// Try with simple connection instead of pool
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'testuser',
  password: 'StrongPass123!',
  database: 'hireconnect_portal',
  port: 3306,
  // Try without SSL first
  ssl: false,
  // Try with insecure auth
  insecureAuth: true
});

connection.connect((err) => {
  if (err) {
    console.log('❌ Connection failed:', err.message);
    console.log('Error code:', err.code);
    console.log('Error stack:', err.stack);
    connection.end();
    process.exit(1);
  } else {
    console.log('✅ Connection successful!');
    
    // Test a simple query
    connection.query('SELECT 1 as test', (err, results) => {
      if (err) {
        console.log('❌ Query failed:', err.message);
      } else {
        console.log('✅ Query successful:', results[0]);
      }
      
      connection.end();
      process.exit(0);
    });
  }
});
