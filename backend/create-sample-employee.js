const { pool } = require('./db-fixed');
const bcrypt = require('bcryptjs');

async function createSampleEmployee() {
  try {
    // Sample employee data
    const sampleEmployee = {
      email: 'employee@hireconnect.com',
      fullName: 'John Doe',
      mobile: '+1234567890',
      password: await bcrypt.hash('password123', 10),
      role: 'employee',
      status: 'active',
      onboarding_step: 1,
      onboarding_status: 'completed'
    };

    // Check if employee already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [sampleEmployee.email]);
    
    if (existing.length > 0) {
      console.log('Sample employee already exists:', existing[0].id);
      return;
    }

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, fullName, mobile, password, role, status, onboarding_step, onboarding_status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [sampleEmployee.email, sampleEmployee.fullName, sampleEmployee.mobile, sampleEmployee.password, sampleEmployee.role, sampleEmployee.status, sampleEmployee.onboarding_step, sampleEmployee.onboarding_status]
    );

    const userId = result.insertId;

    console.log('Sample employee created with ID:', userId);

    // Insert employee profile
    await pool.query(
      `INSERT INTO employee_profiles (user_id, dob, gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location, position, experience)
       VALUES (?, '1990-01-01', 'Male', 'Indian', 'Bachelor of Engineering', 'Software Engineering', 'MIT', 2012, 8.5, 50000, 'Mumbai', 'Software Developer', 5)
       ON DUPLICATE KEY UPDATE dob = VALUES(dob)`,
      [userId]
    );

    // Insert onboarding data
    const onboardingData = {
      fullName: sampleEmployee.fullName,
      personalEmail: sampleEmployee.email,
      jobTitle: 'Software Developer',
      mobileNumber: sampleEmployee.mobile,
      accountNumber: '123456789012',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      dateOfJoining: '2023-01-01',
      workLocation: 'Mumbai',
      experience: 5,
      dob: '1990-01-01',
      gender: 'Male',
      nationality: 'Indian',
      qualification: 'Bachelor of Engineering',
      specialization: 'Software Engineering',
      college: 'MIT',
      graduationYear: 2012,
      cgpa: 8.5,
      expectedSalary: 50000
    };

    await pool.query(
      'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, 1, ?, NOW()) ON DUPLICATE KEY UPDATE data = ?, submitted_at = NOW()',
      [userId, JSON.stringify(onboardingData), JSON.stringify(onboardingData)]
    );

    // Insert sample profile photo record (no actual file)
    await pool.query(
      'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?) ON DUPLICATE KEY UPDATE file_path = VALUES(file_path)',
      [userId, 'passport_photo', 'profile.jpg', '/uploads/profile-photos/sample.jpg', 'APPROVED']
    );

    console.log('✅ Sample employee profile and data created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample employee:', error);
  } finally {
    pool.end();
  }
}

createSampleEmployee();
