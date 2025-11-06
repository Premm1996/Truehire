const pool = require('./db-fixed');

async function testDBConnection() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    const [result] = await pool.query('SELECT 1 as test');
    console.log('✅ Basic connection successful:', result);

    // Test user lookup
    console.log('Testing user lookup...');
    const [users] = await pool.query('SELECT id, email, role, is_admin FROM users WHERE LOWER(email) = LOWER(?)', ['admin@truerize.com']);
    console.log('✅ User lookup successful, found', users.length, 'users');

    if (users.length > 0) {
      console.log('User details:', users[0]);
    } else {
      console.log('❌ No admin user found');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error sqlMessage:', error.sqlMessage);
  } finally {
    process.exit(0);
  }
}

testDBConnection();
