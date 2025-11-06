const db = require('./db-fixed');
const bcrypt = require('bcrypt');

async function checkUserPasswords() {
  try {
    console.log('Checking user passwords...');

    const [rows] = await db.query(
      'SELECT id, email, password, role, is_admin FROM users ORDER BY id'
    );

    console.log('Users and password hashes:');
    console.log('ID | Email | Password Hash | Role | Is Admin');
    console.log('---|-------|---------------|------|---------');

    for (const user of rows) {
      console.log(`${user.id} | ${user.email} | ${user.password.substring(0, 20)}... | ${user.role} | ${user.is_admin}`);

      // Test common passwords
      const testPasswords = ['password123', 'password', '123456', 'admin123'];

      for (const testPass of testPasswords) {
        const isMatch = await bcrypt.compare(testPass, user.password);
        if (isMatch) {
          console.log(`  ✅ Password for ${user.email}: ${testPass}`);
          break;
        }
      }
    }

  } catch (error) {
    console.error('Error checking passwords:', error);
  } finally {
    process.exit(0);
  }
}

checkUserPasswords();
