const fetch = require('node-fetch');

// Test the updated candidate profile endpoint
const testCandidateProfileFix = async () => {
  console.log('🧪 Testing updated candidate profile endpoint...');
  
  // Test data with proper format
  const testProfile = {
    fullName: 'Jane Smith',
    email: 'jane.smith.test@example.com',
    phone: '123-456-7890',
    position: 'Software Engineer',
    experience: '3 years',
    skills: 'JavaScript, React, Node.js',
    education: 'Bachelor of Computer Science',
    agree: true
  };

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const apiUrl = `${backendUrl}/api/candidates`;

  try {
    console.log('1. Testing with valid data...');
    
    // Test the backend directly
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith.test@example.com',
        phone: '123-456-7890',
        position: 'Software Engineer',
        experience: '3 years',
        skills: 'JavaScript, React, Node.js',
        education: 'Bachelor of Computer Science',
        agree: true
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend validation passed');
      console.log('✅ Profile created successfully:', result);
      return true;
    } else {
      console.log('❌ Backend validation failed:', result);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
};

// Test with edge cases
const testEdgeCases = async () => {
  console.log('\n🧪 Testing edge cases...');
  
  const testCases = [
    {
      name: 'Empty fullName',
      data: { firstName: '', lastName: 'Smith', email: 'test@test.com', phone: '123-456-7890', position: 'Dev', experience: '1', skills: 'JS', education: 'BS', agree: true }
    },
    {
      name: 'Invalid phone',
      data: { firstName: 'Test', lastName: 'User', email: 'test@test.com', phone: 'invalid', position: 'Dev', experience: '1', skills: 'JS', education: 'BS', agree: true }
    },
    {
      name: 'Whitespace fields',
      data: { firstName: '  Test  ', lastName: '  User  ', email: '  test@test.com  ', phone: '  123-456-7890  ', position: '  Dev  ', experience: '  1  ', skills: '  JS  ', education: '  BS  ', agree: true }
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${testCase.name}: Success`);
      } else {
        console.log(`⚠️ ${testCase.name}: ${result.error || 'Failed'}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error.message}`);
    }
  }
};

// Run tests
if (require.main === module) {
  testCandidateProfileFix().then(success => {
    if (success) {
      console.log('🎉 All tests passed! Profile creation is working correctly.');
      testEdgeCases().then(() => {
        console.log('✅ Edge case testing completed');
        process.exit(0);
      });
    } else {
      console.log('❌ Tests failed. Please check the implementation.');
      process.exit(1);
    }
  });
}

module.exports = { testCandidateProfileFix, testEdgeCases };
