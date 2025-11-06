const { pool } = require('./db');

async function testConnection() {
  try {
    console.log('Testing database connection...');

    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('Connection successful, test result:', rows[0]);

    // Check users table
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users[0].count);

    // Check columns
    const [columns] = await pool.execute('DESCRIBE users');
    const columnNames = columns.map(col => col.Field);
    console.log('Columns in users:', columnNames.join(', '));

    if (columnNames.includes('plain_password')) {
      console.log('✅ plain_password column exists');
    } else {
      console.log('❌ plain_password column is missing');
    }

  } catch (error) {
    console.error('Connection error:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();
