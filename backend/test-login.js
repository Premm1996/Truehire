require('dotenv').config({ path: '../.env' });

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@truerize.com',
        password: 'Tbdam@583225',
        role: 'admin'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

  } catch (error) {
    console.error('Test login error:', error);
  }
}

testLogin();
