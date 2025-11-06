const { pool } = require('./db');

async function countEmployees() {
  try {
    console.log('Connecting to database...');

    // Query to count employees
    const [result] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'employee'");

    console.log('Total employee accounts:', result[0].count);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

countEmployees();
