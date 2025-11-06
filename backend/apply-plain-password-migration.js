const mysql = require('mysql2/promise');
const fs = require('fs');

async function applyMigration() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Tbdam@583225',
      database: 'hireconnect_portal'
    });

    console.log('Connected to database');

    // Read the migration file
    const migrationSQL = fs.readFileSync('./migrations/add-plain-password-field.sql', 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 100) + '...');
        try {
          await connection.execute(statement);
          console.log('✓ Statement executed successfully');
        } catch (err) {
          // Ignore errors for already existing columns
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ Column already exists, skipping');
          } else {
            console.error('Error executing statement:', err.message);
          }
        }
      }
    }

    console.log('Migration completed');

    // Verify the columns were added
    const [rows] = await connection.execute('DESCRIBE users');
    const columns = rows.map(row => row.Field);
    console.log('Columns in users:', columns.join(', '));

    if (!columns.includes('plain_password')) {
      console.log('plain_password column is still missing');
    } else {
      console.log('plain_password column exists');
    }

    await connection.end();
    console.log('Migration script completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();
