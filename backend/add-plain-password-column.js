const mysql = require('mysql2/promise');

async function addColumn() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'hireconnect',
      password: 'Tbdam@583225',
      database: 'hireconnect_portal'
    });

    console.log('Connected to database');

    // Add the column
    await connection.execute('ALTER TABLE users ADD COLUMN plain_password VARCHAR(255)');

    console.log('✅ Column added successfully');

    // Update existing users
    await connection.execute("UPDATE users SET plain_password = 'DefaultPassword123' WHERE plain_password IS NULL");

    console.log('✅ Existing users updated');

    // Add index
    await connection.execute('CREATE INDEX idx_users_plain_password ON users(plain_password)');

    console.log('✅ Index created');

    // Verify
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

addColumn();
