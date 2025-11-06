require('dotenv').config({ path: '../.env' });
const { pool } = require('./db');

async function checkTables() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log('- ' + Object.values(table)[0]);
    });

    // Check if employee_profiles exists
    const [employeeProfiles] = await pool.query('SHOW TABLES LIKE "employee_profiles"');
    if (employeeProfiles.length > 0) {
      console.log('✅ employee_profiles table exists');
      const [count] = await pool.query('SELECT COUNT(*) as count FROM employee_profiles');
      console.log(`Employee profiles count: ${count[0].count}`);
    } else {
      console.log('❌ employee_profiles table does not exist');
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();
