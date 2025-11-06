const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db-fixed');

async function testLoginDirect() {
  try {
    console.log('🔐 Testing login logic directly...');

    const email = 'admin@truerize.com';
    const password = 'Tbdam@583225';

    // Find user by email
    console.log('🔍 Querying database for user...');
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (rows.length === 0) {
      console.error('❌ No user found for email:', email);
      return;
    }

    const user = rows[0];
    console.log('👤 User found:', { id: user.id, email: user.email, role: user.role });

    // Check password
    console.log('🔑 Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.error('❌ Password mismatch');
      return;
    }
    console.log('✅ Password valid');

    // Check if user is admin
    const isAdmin = user.is_admin === 1 || user.role === 'admin';
    console.log('👑 Admin check:', { isAdmin, role: user.role, is_admin: user.is_admin });

    // Generate JWT token
    console.log('🔐 Generating JWT token...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET environment variable is required');
      return;
    }

    let token;
    try {
      token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '24h' }
      );
      console.log('✅ JWT token generated successfully');
    } catch (jwtError) {
      console.error('❌ JWT token generation error:', jwtError);
      return;
    }

    console.log('🎉 Login logic successful!');
    console.log('Token preview:', token.substring(0, 50) + '...');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.error('Error stack:', error.stack);
  }
}

testLoginDirect();
