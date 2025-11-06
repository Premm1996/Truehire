const pool = require('./db-fixed');

async function checkPhoto() {
  try {
    const userId = 4;

    // Check employee_profiles table
    const [profileRows] = await pool.query('SELECT photo FROM employee_profiles WHERE user_id = ?', [userId]);
    console.log('Photo in employee_profiles for user 4:', profileRows[0]?.photo || 'No photo in profile table');

    // Check documents table
    const [docRows] = await pool.query('SELECT file_path FROM documents WHERE user_id = ? AND document_type = "passport_photo"', [userId]);
    console.log('Photo in documents table for user 4:', docRows[0]?.file_path || 'No photo in documents table');

    // Check if user exists
    const [userRows] = await pool.query('SELECT id, fullName FROM users WHERE id = ?', [userId]);
    console.log('User 4 exists:', userRows[0] ? 'Yes' : 'No');
    if (userRows[0]) {
      console.log('User name:', userRows[0].fullName);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPhoto();
