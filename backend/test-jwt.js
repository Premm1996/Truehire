const jwt = require('jsonwebtoken');

const jwtSecret = 'dev-jwt-secret-key-change-in-production-123456789';

console.log('Testing JWT with secret length:', jwtSecret.length);

try {
  const token = jwt.sign(
    { userId: 1, email: 'test@example.com', role: 'admin' },
    jwtSecret,
    { expiresIn: '24h' }
  );
  console.log('✅ JWT token generated successfully');
  console.log('Token length:', token.length);

  // Try to verify the token
  const decoded = jwt.verify(token, jwtSecret);
  console.log('✅ JWT token verified successfully');
  console.log('Decoded payload:', decoded);

} catch (error) {
  console.error('❌ JWT error:', error.message);
  console.error('Error stack:', error.stack);
}
