const { auditLog } = require('./middleware/auth');
const pool = require('./db-fixed');

async function testAuditLog() {
  try {
    console.log('Testing auditLog function...');
    await auditLog(5, 3, 'APPROVE_EMPLOYEE', { approvedBy: 'admin@truerize.com', employeeId: 5 }, '127.0.0.1', 'Test User Agent');
    console.log('✅ auditLog function executed successfully');

    // Check if the record was inserted
    const [rows] = await pool.query('SELECT * FROM audit_logs WHERE user_id = 5 AND action = ? ORDER BY id DESC LIMIT 1', ['APPROVE_EMPLOYEE']);
    if (rows.length > 0) {
      console.log('✅ Audit log record found:', rows[0]);
    } else {
      console.log('❌ No audit log record found');
    }
  } catch (error) {
    console.error('❌ auditLog function failed:', error);
  }
}

testAuditLog();
