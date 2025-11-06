const axios = require('axios');

// Test script to verify the candidate profile endpoint
const testCandidateEndpoint = async () => {
  console.log('Testing candidate profile endpoint...');
  
  const testData = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    position: 'Software Engineer',
    experience: '5 years',
    skills: 'JavaScript, Node.js, React',
    education: 'Bachelor of Computer Science',
    agree: true
  };

  try {
    // First, get a valid token (you'll need to adjust this based on your auth setup)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Got authentication token');

    // Test the candidate creation endpoint
    const response = await axios.post('http://localhost:5000/api/candidates', {
      firstName: testData.fullName.split(' ')[0],
      lastName: testData.fullName.split(' ').slice(1).join(' '),
      email: testData.email,
      phone: testData.phone,
      position: testData.position,
      experience: testData.experience,
      skills: testData.skills,
      education: testData.education,
      agree: testData.agree
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Candidate created successfully:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.response?.data || error.message);
    return false;
  }
};

// Run the test
if (require.main === module) {
  testCandidateEndpoint();
}

module.exports = { testCandidateEndpoint };
