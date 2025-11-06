const axios = require('axios');

async function testEmployeeLogin() {
  try {
    console.log('Testing employee login with john@example.com...');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });

    console.log('✅ Employee login successful:', response.data);

    // Check localStorage values that would be set in frontend
    console.log('\nFrontend localStorage values that would be set:');
    console.log('token:', response.data.token ? 'SET' : 'NOT SET');
    console.log('isAdmin:', response.data.user.is_admin ? 'true' : 'false');
    console.log('employeeId:', response.data.user.id);
    console.log('onboardingStatus:', response.data.user.onboardingStatus || 'NOT_STARTED');
    console.log('onboardingStep:', response.data.user.onboardingStep || '0');

    // Check redirect logic
    console.log('\nRedirect logic:');
    if (response.data.user.is_admin || response.data.user.role === 'admin') {
      console.log('Redirect: /admin/dashboard');
    } else {
      const onboardingStatus = response.data.user.onboardingStatus;
      const onboardingStep = response.data.user.onboardingStep || 0;

      if (onboardingStatus === 'COMPLETE') {
        console.log('Redirect: /employee-dashboard/' + response.data.user.id);
      } else {
        if (onboardingStep === 0) {
          console.log('Redirect: /onboarding-form');
        } else if (onboardingStep === 1) {
          console.log('Redirect: /offer-letter');
        } else {
          console.log('Redirect: /onboarding/step-' + (onboardingStep + 1));
        }
      }
    }

  } catch (error) {
    console.log('❌ Employee login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testEmployeeLogin();
