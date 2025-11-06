#!/usr/bin/env node

/**
 * Update Admin Credentials Script
 * Updates the admin user to use the correct credentials from the spec
 */

const bcrypt = require('bcryptjs');
const pool = require('../db-fixed');

async function updateAdminCredentials() {
  try {
    console.log('🔧 Updating admin credentials...');

    const adminEmail = 'admin@truerize.com';
    const adminPassword = 'Tbdam@583225';

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user already exists with the email
    const [existingAdmin] = await pool.query(
      'SELECT id, is_admin FROM users WHERE LOWER(email) = LOWER(?)',
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      // Update existing admin user
      console.log('👑 Updating existing admin user credentials...');
      await pool.query(`
        UPDATE users
        SET password = ?, is_admin = TRUE
        WHERE email = ?
      `, [hashedPassword, adminEmail]);
    } else {
      // Update the user with is_admin = TRUE
      console.log('👑 Updating admin user credentials...');
      await pool.query(`
        UPDATE users
        SET email = ?, password = ?
        WHERE is_admin = TRUE
      `, [adminEmail, hashedPassword]);
    }

    console.log('✅ Admin credentials updated!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);

    // Verify the admin user
    const [adminUser] = await pool.query(`
      SELECT id, email, role, is_admin, isVerified
      FROM users
      WHERE email = ?
    `, [adminEmail]);

    console.log('✅ Admin verification:', adminUser[0]);

  } catch (error) {
    console.error('❌ Admin credentials update failed:', error);
    throw error;
  } finally {
    if (pool && pool.end) {
      await pool.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  updateAdminCredentials()
    .then(() => {
      console.log('🎉 Admin credentials updated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin credentials update failed:', error);
      process.exit(1);
    });
}

module.exports = updateAdminCredentials;
