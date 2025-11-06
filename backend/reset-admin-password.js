const bcrypt = require('bcryptjs');
const pool = require('./db-fixed');

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');

    // Hash the new password
    const newPassword = 'Tbdam@583225';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password hashed successfully');

    // Update the admin user password
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@truerize.com']
    );

    if (result.affectedRows > 0) {
      console.log('Admin password updated successfully');
      console.log('Email: admin@truerize.com');
      console.log('Password: Tbdam@583225');
    } else {
      console.log('Admin user not found');
    }

  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();
