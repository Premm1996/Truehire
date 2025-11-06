const { pool } = require('./db-fixed');
const bcrypt = require('bcryptjs');

async function ensureUser4() {
  try {
    const userId = 4;
    const email = 'prem@gmail.com';
    const fullName = 'Prem Kumar';
    const mobile = '+919876543210';
    const password = 'prem@gmail.com'; // same as email for simplicity

    // Check if user exists
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      console.log('Creating user 4...');
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        'INSERT INTO users (id, email, fullName, mobile, password, role, status, onboarding_step, onboarding_status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, "employee", "active", 1, "completed", NOW(), NOW())',
        [userId, email, fullName, mobile, hashedPassword]
      );
      console.log('User 4 created.');
    } else {
      console.log('User 4 already exists.');
    }

    // Ensure employee profile exists
    const [profiles] = await pool.query('SELECT id FROM employee_profiles WHERE user_id = ?', [userId]);
    if (profiles.length === 0) {
      console.log('Creating employee profile for user 4...');
      await pool.query(
        `INSERT INTO employee_profiles (user_id, fullName, email, mobile, dob, gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location, position, experience, personalEmail, jobTitle, mobileNumber, accountNumber, ifscCode, bankName, dateOfJoining, workLocation)
         VALUES (?, ?, ?, ?, "1990-05-15", "Male", "Indian", "Bachelor of Technology", "Computer Science", "IIT Delhi", 2015, 8.7, 60000, "Bangalore", "Software Engineer", 8, ?, ?, ?, "123456789012", "SBIN0001234", "State Bank of India", "2020-01-01", "Bangalore")`,
        [userId, fullName, email, mobile, email, 'Software Engineer', mobile]
      );
      console.log('Employee profile created.');
    } else {
      console.log('Employee profile already exists.');
    }

    console.log('✅ User 4 setup complete.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    pool.end();
  }
}

ensureUser4();
