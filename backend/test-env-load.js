require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('Testing environment variable loading from backend directory:');
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET value (first 10 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'undefined');
console.log('DB_HOST loaded:', process.env.DB_HOST);
console.log('DB_USER loaded:', process.env.DB_USER);
console.log('DB_NAME loaded:', process.env.DB_NAME);
console.log('NODE_ENV loaded:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
