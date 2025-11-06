const { pool } = require('./db-fixed');

async function checkUsers() {
  try {
    console.log('=== USERS TABLE ===');
    const [users] = await pool.query('SELECT id, email, fullName, role, status, createdAt FROM users ORDER BY createdAt DESC LIMIT 10');
    console.table(users.map(u => ({ id: u.id, email: u.email, name: u.fullName, role: u.role, status: u.status })));

    console.log('\n=== EMPLOYEE PROFILES ===');
    const [profiles] = await pool.query('SELECT user_id, dob, gender, nationality, qualification FROM employee_profiles LIMIT 5');
    console.table(profiles);

    console.log('\n=== ONBOARDING ANSWERS ===');
    const [onboarding] = await pool.query('SELECT user_id, step, submitted_at FROM onboarding_answers ORDER BY submitted_at DESC LIMIT 5');
    console.table(onboarding);

    console.log('\n=== DOCUMENTS (Profile Photos) ===');
    const [photos] = await pool.query('SELECT user_id, document_type, file_name FROM documents WHERE document_type = "passport_photo" LIMIT 5');
    console.table(photos);

  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    pool.end();
  }
}

checkUsers();
