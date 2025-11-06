require('dotenv').config();

console.log('Environment Variables Check:');
console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD is set:', !!process.env.DB_PASSWORD);
console.log('NODE_ENV:', process.env.NODE_ENV);
