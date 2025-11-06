const pool = require('./db-fixed');

async function checkAuditLogs() {
  try {
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5');
    console.log('Recent audit logs:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Action: ${row.action}, Entity Type: ${row.entity_type}, User: ${row.user_id}, Admin: ${row.admin_id}`);
    });
  } catch (error) {
    console.error('Error checking audit logs:', error);
  }
}

checkAuditLogs();
