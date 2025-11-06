#!/usr/bin/env node

/**
 * Admin User Setup Script
 * Creates the admin user with email: admin@gmail.com and password: admin@gmail.com
 * This should be the ONLY admin user for the entire website
 */

const bcrypt = require('bcryptjs');
const pool = require('../db');

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user...');
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@gmail.com';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Remove any existing admin users
    console.log('🧹 Removing existing admin users...');
    await pool.query('DELETE FROM users WHERE is_admin = TRUE OR email LIKE ?', ['%admin%']);
    
    // Insert the admin user
    console.log('👑 Creating admin user...');
    const [result] = await pool.query(`
      INSERT INTO users (
        fullName, 
        email, 
        password, 
        mobile, 
        role, 
        is_admin, 
        termsAgreed, 
        isVerified,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'System Administrator',
      adminEmail,
      hashedPassword,
      '0000000000',
      'admin',
      true,
      true,
      true,
      'active'
    ]);
    
    // Create onboarding status for admin
    await pool.query(`
      INSERT INTO onboarding_status (user_id, current_step)
      VALUES (?, 'COMPLETED')
    `, [result.insertId]);
    
    console.log('✅ Admin user setup complete!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 User ID:', result.insertId);
    
    // Verify the admin user
    const [adminUser] = await pool.query(`
      SELECT id, email, role, is_admin, isVerified 
      FROM users 
      WHERE email = ?
    `, [adminEmail]);
    
    console.log('✅ Admin verification:', adminUser[0]);
    
  } catch (error) {
    console.error('❌ Admin setup failed:', error);
    throw error;
  } finally {
    if (pool && pool.end) {
      await pool.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupAdminUser()
    .then(() => {
      console.log('🎉 Admin setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupAdminUser;
