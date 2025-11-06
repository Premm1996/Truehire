const { pool } = require('./db');

async function checkEmployeeProfile() {
  try {
    console.log('Checking employee profile for ID: 4');

    // Check users table
    const [userRows] = await pool.query('SELECT id, fullName, email, role, approved FROM users WHERE id = ? AND role = ?', [4, 'employee']);
    console.log('User data:', userRows);

    if (userRows.length === 0) {
      console.log('No user found with ID 4 and role employee');
      return;
    }

    // Check employee_profiles table
    const [profileRows] = await pool.query('SELECT * FROM employee_profiles WHERE user_id = ?', [4]);
    console.log('Profile data:', profileRows);

    // Check onboarding_answers
    const [onboardingRows] = await pool.query('SELECT data FROM onboarding_answers WHERE user_id = ? AND step = 1', [4]);
    console.log('Onboarding data:', onboardingRows);

    // Check documents table for photos
    const [docRows] = await pool.query('SELECT id, document_type, file_name, file_path, status FROM documents WHERE user_id = ? AND document_type = ?', [4, 'passport_photo']);
    console.log('Documents table (photos):', docRows);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEmployeeProfile();
