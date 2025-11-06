const pool = require('./db-fixed');

async function check() {
  try {
    const [rows] = await pool.execute(`SHOW TABLES LIKE 'attendance_breaks'`);
    if (rows.length > 0) {
      console.log('attendance_breaks exists');
      const [cols] = await pool.execute('DESCRIBE attendance_breaks');
      console.log('Columns:');
      cols.forEach(c => console.log(`  ${c.Field} - ${c.Type}`));
    } else {
      console.log('attendance_breaks does not exist');
    }

    // Also check attendance_leave_balances
    console.log('Checking attendance_leave_balances...');
    const [rows2] = await pool.execute(`SHOW TABLES LIKE 'attendance_leave_balances'`);
    if (rows2.length > 0) {
      console.log('✅ attendance_leave_balances exists');
    } else {
      console.log('❌ attendance_leave_balances does not exist');
    }
  } catch (e) {
    console.error(e);
  }
}

check();
