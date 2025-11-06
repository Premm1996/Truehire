const mysql = require('mysql2/promise');

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'hireconnect',
      password: 'Tbdam@583225',
      database: 'hireconnect_portal'
    });

    console.log('Connected to database');

    // Check employee_profiles table structure
    const [rows] = await connection.execute('DESCRIBE employee_profiles');
    console.log('Employee profiles table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
    });

    // Check if department column exists
    const hasDepartment = rows.some(row => row.Field === 'department');
    console.log(`\nDepartment column exists: ${hasDepartment}`);

    // Check other columns used in the INSERT
    const columnsToCheck = ['employmentType', 'workMode', 'skills', 'languages', 'personalEmail', 'bio'];
    columnsToCheck.forEach(col => {
      const exists = rows.some(row => row.Field === col);
      console.log(`${col} column exists: ${exists}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
