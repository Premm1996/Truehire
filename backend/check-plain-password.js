const mysql = require('mysql2/promise');

async function checkColumn() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Tbdam@583225',
      database: 'hireconnect_portal'
    });

    console.log('Connected to database');

    const [rows] = await connection.execute('DESCRIBE users');
    const columns = rows.map(row => row.Field);
    console.log('Columns in users:', columns.join(', '));

    if (columns.includes('plain_password')) {
      console.log('✅ plain_password column exists');
    } else {
      console.log('❌ plain_password column is missing');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkColumn();
