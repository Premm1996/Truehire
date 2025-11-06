const { loadEnvironment } = require('./backend/config/envLoader');
loadEnvironment();

const expectedPassword = 'Tbdam@583225';
const currentPassword = process.env.DB_PASSWORD;

if (currentPassword === expectedPassword) {
  console.log('✅ DB_PASSWORD is correctly set to:', expectedPassword);
} else {
  console.log('❌ DB_PASSWORD is not set to the expected value.');
  console.log('Expected:', expectedPassword);
  console.log('Current:', currentPassword || 'NOT SET');
}
