const db = require('./db');

db.all("SELECT id, fullName, email, role, onboarding_status FROM users", [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Users in database:');
  rows.forEach(user => {
    console.log(`${user.id}: ${user.fullName} - ${user.email} - Role: ${user.role} - Status: ${user.onboarding_status}`);
  });
  console.log(`Total users: ${rows.length}`);
});
