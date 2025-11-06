const axios = require('axios');

async function testCorrectAdminLogin() {
  try {
    console.log('Testing correct admin login on port 5000...');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@truerize.com',
      password: 'Tbdam@583225'
    });

    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', {
      id: response.data.user.id,
      email: response.data.user.email,
      role: response.data.user.role,
      is_admin: response.data.user.is_admin
    });
    console.log('Token received:', response.data.token ? 'Yes' : 'No');

  } catch (error) {
    console.error('❌ Login failed:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 500) {
      console.log('500 error details:', error.response.data);
    }
  }
}

testCorrectAdminLogin();
