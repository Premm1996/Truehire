const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testEmployeeAPI() {
  const baseUrl = 'http://localhost:5000';
  const testEmail = 'grand3@gmail.com';
  const testPassword = 'grand3@gmail.com';

  console.log('🧪 Starting comprehensive API testing...\n');

  try {
    // Test 1: Login
    console.log('1️⃣ Testing Login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful, token received\n');

    // Test 2: Get Employee Profile
    console.log('2️⃣ Testing Employee Profile Retrieval...');
    const profileResponse = await fetch(`${baseUrl}/api/employees/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const profileData = await profileResponse.json();
    console.log('Profile Response:', JSON.stringify(profileData, null, 2));

    if (profileResponse.ok) {
      console.log('✅ Profile retrieval successful');

      // Check if photo is included
      if (profileData.photo) {
        console.log('✅ Photo found in profile:', profileData.photo);
      } else {
        console.log('⚠️ No photo in profile data');
      }

      // Check if registration data is included
      if (profileData.fullName || profileData.position || profileData.department) {
        console.log('✅ Registration data found in profile');
      } else {
        console.log('⚠️ Registration data missing from profile');
      }
    } else {
      console.log('❌ Profile retrieval failed:', profileData);
    }

    // Test 3: Get Employee Profile by ID
    console.log('\n3️⃣ Testing Employee Profile by ID...');
    const userId = profileData.id || 7; // Fallback to known user ID
    const profileByIdResponse = await fetch(`${baseUrl}/api/employees/${userId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const profileByIdData = await profileByIdResponse.json();
    console.log('Profile by ID Response:', JSON.stringify(profileByIdData, null, 2));

    if (profileByIdResponse.ok) {
      console.log('✅ Profile by ID retrieval successful');
    } else {
      console.log('❌ Profile by ID retrieval failed:', profileByIdData);
    }

    // Test 4: Test Onboarding Status
    console.log('\n4️⃣ Testing Onboarding Status...');
    const onboardingResponse = await fetch(`${baseUrl}/api/onboarding/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const onboardingData = await onboardingResponse.json();
    console.log('Onboarding Status:', JSON.stringify(onboardingData, null, 2));

    if (onboardingResponse.ok) {
      console.log('✅ Onboarding status retrieved successfully');
    } else {
      console.log('❌ Onboarding status retrieval failed:', onboardingData);
    }

    // Test 5: Test Photo URL Construction
    console.log('\n5️⃣ Testing Photo URL Construction...');
    if (profileData.photo) {
      const photoUrl = `${baseUrl}${profileData.photo}`;
      console.log('Constructed Photo URL:', photoUrl);

      try {
        const photoResponse = await fetch(photoUrl);
        if (photoResponse.ok) {
          console.log('✅ Photo URL is accessible');
        } else {
          console.log('❌ Photo URL not accessible:', photoResponse.status);
        }
      } catch (error) {
        console.log('❌ Error accessing photo URL:', error.message);
      }
    }

    console.log('\n🎉 API Testing Complete!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testEmployeeAPI();
