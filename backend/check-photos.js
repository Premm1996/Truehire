const { pool } = require('./db');

(async () => {
  try {
    console.log('Checking employee profiles with photos...');
    const [rows] = await pool.query('SELECT id, user_id, fullName, photo FROM employee_profiles WHERE photo IS NOT NULL LIMIT 5');
    console.log('Employee profiles with photos:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, User ID: ${row.user_id}, Name: ${row.fullName}, Photo: ${row.photo}`);
    });

    console.log('\nChecking users table for onboarding data...');
    const [userRows] = await pool.query('SELECT id, fullName, photo FROM users WHERE photo IS NOT NULL LIMIT 5');
    console.log('Users with photos:');
    userRows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.fullName}, Photo: ${row.photo}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
})();
