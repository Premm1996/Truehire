const db = require('./db');

async function checkUsers() {
  try {
    console.log('Checking users in database...');

    // Count total users
    const [totalRows] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('Total users:', totalRows[0].count);

    // Count employees and candidates
    const [empRows] = await db.query("SELECT COUNT(*) as count FROM users WHERE role IN ('employee', 'candidate')");
    console.log('Employees and candidates:', empRows[0].count);

    // List them
    const [users] = await db.query("SELECT id, fullName, email, role, approved FROM users WHERE role IN ('employee', 'candidate') ORDER BY createdAt DESC LIMIT 10");
    console.log('Recent employees/candidates:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}, Approved: ${user.approved}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
