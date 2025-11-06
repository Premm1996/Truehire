const mysql = require('mysql2/promise');

async function checkEmployees() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'hireconnect',
      password: 'Tbdam@583225',
      database: 'hireconnect_portal'
    });

    console.log('Connected to database');

    // Check users with role employee or candidate
    const [rows] = await connection.execute(
      'SELECT id, fullName, email, role, onboarding_status, approved FROM users WHERE role IN (?, ?) ORDER BY createdAt DESC',
      ['employee', 'candidate']
    );

    console.log('Employees/Candidates found:', rows.length);
    rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.fullName}, Email: ${row.email}, Role: ${row.role}, Status: ${row.onboarding_status}, Approved: ${row.approved}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmployees();
