const pool = require('./db-fixed');

async function checkPhoto() {
  try {
    const [rows] = await pool.query('SELECT photo FROM employee_profiles WHERE user_id = 4');
    console.log('Photo path for user 4:', rows[0]?.photo || 'No photo found');

    // Also check if user exists
    const [userRows] = await pool.query('SELECT id, fullName FROM users WHERE id = 4');
    console.log('User 4 exists:', userRows[0] ? 'Yes' : 'No');
    if (userRows[0]) {
      console.log('User name:', userRows[0].fullName);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPhoto();
