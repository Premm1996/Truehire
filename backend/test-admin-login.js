const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login on port 5000...');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@truerize.com',
      password: 'Tbdam@583225' // Correct admin password from database init script
    });

    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 500) {
      console.log('500 error details:', error.response.data);
    }
  }
}

testAdminLogin();
