require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

console.log('=== Environment Variables Test ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (masked: ' + '*'.repeat(8) + ')' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

console.log('\n=== .env File Path ===');
const path = require('path');
const envPath = path.resolve(__dirname, '.env');
console.log('Expected .env path:', envPath);

const fs = require('fs');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log('📄 .env file contains', lines.length, 'non-comment lines');
} else {
  console.log('❌ .env file does NOT exist');
}
