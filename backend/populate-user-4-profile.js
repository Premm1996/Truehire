const { pool } = require('./db-fixed');
const bcrypt = require('bcryptjs');

async function populateUser4Profile() {
  try {
    const userId = 4;
    const email = 'prem@gmail.com';
    const fullName = 'Prem Kumar';
    const mobile = '+919876543210';

    // Check if user exists
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      console.log('User 4 not found. Creating user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('prem@gmail.com', 10);
      
      // Insert user
      const [result] = await pool.query(
        'INSERT INTO users (id, email, fullName, mobile, password, role, status, onboarding_step, onboarding_status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, "employee", "active", 1, "completed", NOW(), NOW())',
        [userId, email, fullName, mobile, hashedPassword]
      );
      console.log('User 4 created.');
    } else {
      console.log('User 4 exists:', users[0]);
      
      // Update user if needed
      await pool.query(
        'UPDATE users SET fullName = ?, mobile = ?, onboarding_status = "completed" WHERE id = ?',
        [fullName, mobile, userId]
      );
    }

    // Insert/Update employee profile
    await pool.query(
      `INSERT INTO employee_profiles (user_id, fullName, email, mobile, dob, gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location, position, experience, personalEmail, jobTitle, mobileNumber, accountNumber, ifscCode, bankName, dateOfJoining, workLocation)
       VALUES (?, ?, ?, ?, "1990-05-15", "Male", "Indian", "Bachelor of Technology", "Computer Science", "IIT Delhi", 2015, 8.7, 60000, "Bangalore", "Software Engineer", 8, ?, ?, ?, "123456789012", "SBIN0001234", "State Bank of India", "2020-01-01", "Bangalore")
       ON DUPLICATE KEY UPDATE fullName = VALUES(fullName), email = VALUES(email)`,
      [userId, fullName, email, mobile, email, 'Software Engineer', mobile]
    );
    console.log('Employee profile for user 4 updated.');

    // Insert onboarding data
    const onboardingData = {
      fullName,
      personalEmail: email,
      jobTitle: 'Software Engineer',
      mobileNumber: mobile,
      accountNumber: '123456789012',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      dateOfJoining: '2020-01-01',
      workLocation: 'Bangalore',
      experience: 8,
      dob: '1990-05-15',
      gender: 'Male',
      nationality: 'Indian',
      qualification: 'Bachelor of Technology',
      specialization: 'Computer Science',
      college: 'IIT Delhi',
      graduationYear: 2015,
      cgpa: 8.7,
      expectedSalary: 60000
    };

    await pool.query(
      'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, 1, ?, NOW()) ON DUPLICATE KEY UPDATE data = ?, submitted_at = NOW()',
      [userId, JSON.stringify(onboardingData), JSON.stringify(onboardingData)]
    );
    console.log('Onboarding data for user 4 updated.');

    // Insert sample profile photo
    await pool.query(
      'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, "passport_photo", "profile.jpg", "/uploads/profile-photos/prem.jpg", NOW(), "APPROVED") ON DUPLICATE KEY UPDATE file_path = VALUES(file_path)',
      [userId]
    );
    console.log('Profile photo record for user 4 added.');

    console.log('✅ All profile data populated for user 4 (prem@gmail.com)');
  } catch (error) {
    console.error('❌ Error populating profile for user 4:', error);
  } finally {
    pool.end();
  }
}

populateUser4Profile();
