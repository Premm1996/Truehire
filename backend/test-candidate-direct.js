const db = require('./db');
const ValidationService = require('./utils/validation');

// Test the candidate creation functionality directly
const testCandidateCreation = async () => {
  console.log('Testing candidate creation functionality...');
  
  const testData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe.test@example.com',
    phone: '1234567890',
    position: 'Software Engineer',
    experience: '5 years',
    skills: 'JavaScript, Node.js, React',
    education: 'Bachelor of Computer Science',
    agree: true
  };

  try {
    // Test validation
    console.log('1. Testing validation...');
    const validation = ValidationService.validateCandidateData(testData);
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      return false;
    }
    console.log('✅ Validation passed');

    // Test database insertion
    console.log('2. Testing database insertion...');
    
    // Check if email already exists
    const [existing] = await db.query(
      'SELECT id FROM candidates WHERE email = ?',
      [testData.email]
    );

    if (existing.length > 0) {
      console.log('⚠️ Email already exists, using different email...');
      testData.email = `john.doe.test.${Date.now()}@example.com`;
    }

    // Insert test candidate
    const [result] = await db.query(`
      INSERT INTO candidates (first_name, last_name, email, phone, position, experience, skills, education, status, agree)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      testData.firstName,
      testData.lastName,
      testData.email,
      testData.phone,
      testData.position,
      testData.experience,
      testData.skills,
      testData.education,
      testData.agree ? 1 : 0
    ]);

    console.log('✅ Candidate inserted successfully with ID:', result.insertId);

    // Verify the insertion
    const [verify] = await db.query(
      'SELECT * FROM candidates WHERE id = ?',
      [result.insertId]
    );

    if (verify.length > 0) {
      console.log('✅ Candidate verification successful:', {
        id: verify[0].id,
        email: verify[0].email,
        position: verify[0].position,
        status: verify[0].status
      });
      
      // Clean up test data
      await db.query('DELETE FROM candidates WHERE id = ?', [result.insertId]);
      console.log('✅ Test data cleaned up');
      
      return true;
    } else {
      console.log('❌ Candidate verification failed');
      return false;
    }

  } catch (error) {
    console.error('❌ Error testing candidate creation:', error.message);
    return false;
  }
};

// Run the test
if (require.main === module) {
  testCandidateCreation().then(success => {
    if (success) {
      console.log('🎉 All tests passed! Candidate profile creation is working correctly.');
    } else {
      console.log('❌ Tests failed. Please check the implementation.');
    }
    process.exit(0);
  });
}

module.exports = { testCandidateCreation };
