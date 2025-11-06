const mysql = require('mysql2/promise');
require('dotenv').config();

async function initLeaveBalances() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Tbdam@583225',
    database: process.env.DB_NAME || 'hireconnect_portal',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  try {
    // Get all users except admin
    const [users] = await pool.query('SELECT id FROM users WHERE role != ?', ['admin']);

    const year = new Date().getFullYear();

    for (const user of users) {
      console.log(`Initializing leave balances for user ${user.id}`);

      // Initialize balances for each leave type
      const leaveTypes = ['annual', 'sick', 'casual', 'maternity', 'paternity'];
      const allocations = { annual: 12.00, sick: 6.00, casual: 6.00, maternity: 84.00, paternity: 5.00 };

      for (const leaveType of leaveTypes) {
        await pool.query(`
          INSERT IGNORE INTO attendance_leave_balances (user_id, leave_type, allocated_days, year)
          VALUES (?, ?, ?, ?)
        `, [user.id, leaveType, allocations[leaveType], year]);
      }
    }

    console.log('✅ Leave balances initialized for all users');
  } catch (error) {
    console.error('❌ Error initializing leave balances:', error.message);
  } finally {
    await pool.end();
  }
}

initLeaveBalances();
