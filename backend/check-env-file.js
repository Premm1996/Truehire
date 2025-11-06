const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('Checking .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('.env file content:');
    console.log(content);
  } catch (error) {
    console.error('Error reading .env file:', error.message);
  }
} else {
  console.log('.env file does not exist');
}
