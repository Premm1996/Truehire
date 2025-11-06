const mysql = require('mysql2/promise');
const fs = require('fs');

async function applyMigration() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'hireconnect',
      password: 'Tbdam@583225',
      database: 'hireconnect_portal'
    });

    console.log('Connected to database');

    // Read the migration file
    const migrationSQL = fs.readFileSync('./migrations/add-employee-profile-fields.sql', 'utf8');

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
    const [rows] = await connection.execute('DESCRIBE employee_profiles');
    const columns = rows.map(row => row.Field);
    console.log('Columns in employee_profiles:', columns.join(', '));

    const requiredColumns = ['department', 'joiningDate', 'employmentType', 'workMode', 'skills', 'languages', 'personalEmail', 'bio'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));

    if (missingColumns.length > 0) {
      console.log('Still missing columns:', missingColumns.join(', '));

      // Add missing columns manually
      for (const col of missingColumns) {
        let sql = '';
        if (col === 'department') {
          sql = 'ALTER TABLE employee_profiles ADD COLUMN department VARCHAR(255) DEFAULT NULL AFTER position';
        } else if (col === 'joiningDate') {
          sql = 'ALTER TABLE employee_profiles ADD COLUMN joiningDate DATE DEFAULT NULL AFTER department';
        } else if (col === 'employmentType') {
          sql = "ALTER TABLE employee_profiles ADD COLUMN employmentType ENUM('Full-time', 'Contract', 'Part-time', 'Intern') DEFAULT 'Full-time' AFTER joiningDate";
        } else if (col === 'workMode') {
          sql = "ALTER TABLE employee_profiles ADD COLUMN workMode ENUM('Remote', 'Hybrid', 'On-site') DEFAULT 'Hybrid' AFTER employmentType";
        } else if (col === 'skills') {
          sql = 'ALTER TABLE employee_profiles ADD COLUMN skills JSON DEFAULT NULL AFTER workMode';
        } else if (col === 'languages') {
          sql = 'ALTER TABLE employee_profiles ADD COLUMN languages JSON DEFAULT NULL AFTER skills';
        } else if (col === 'personalEmail') {
          sql = 'ALTER TABLE employee_profiles ADD COLUMN personalEmail VARCHAR(255) DEFAULT NULL AFTER languages';
        } else if (col === 'bio') {
          sql = 'ALTER TABLE employee_profiles ADD COLUMN bio TEXT DEFAULT NULL AFTER personalEmail';
        }

        if (sql) {
          console.log('Adding column:', col);
          await connection.execute(sql);
        }
      }
    } else {
      console.log('All required columns are present');
    }

    await connection.end();
    console.log('Migration script completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();
