const mysql = require('mysql2/promise');

async function checkUsersSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'hireconnect',
      password: 'Tbdam@583225',
      database: 'hireconnect_portal'
    });

    console.log('Connected to database');

    // Check users table structure
    const [rows] = await connection.execute('DESCRIBE users');
    console.log('Users table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
    });

    // Check if plain_password column exists
    const hasPlainPassword = rows.some(row => row.Field === 'plain_password');
    console.log(`\nPlain password column exists: ${hasPlainPassword}`);

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsersSchema();
