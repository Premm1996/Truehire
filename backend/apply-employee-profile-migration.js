const pool = require('./db-fixed');

async function applyEmployeeProfileMigration() {
  try {
    console.log('Applying employee profile fields migration...');

    // Check current columns in employee_profiles table
    const [columns] = await pool.execute('DESCRIBE employee_profiles');
    const columnNames = columns.map(col => col.Field);
    console.log('Current employee_profiles columns:', columnNames.join(', '));

    // Check which columns are missing
    const requiredColumns = [
      'department',
      'joiningDate',
      'employmentType',
      'workMode',
      'skills',
      'languages',
      'personalEmail',
      'bio'
    ];

    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    console.log('Missing columns:', missingColumns.join(', '));

    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist');
      return;
    }

    // Add missing columns
    console.log('Adding missing columns...');

    if (missingColumns.includes('department')) {
      await pool.execute('ALTER TABLE employee_profiles ADD COLUMN department VARCHAR(255) DEFAULT NULL AFTER position');
      console.log('✅ Added department column');
    }

    if (missingColumns.includes('joiningDate')) {
      await pool.execute('ALTER TABLE employee_profiles ADD COLUMN joiningDate DATE DEFAULT NULL AFTER department');
      console.log('✅ Added joiningDate column');
    }

    if (missingColumns.includes('employmentType')) {
      await pool.execute("ALTER TABLE employee_profiles ADD COLUMN employmentType ENUM('Full-time', 'Contract', 'Part-time', 'Intern') DEFAULT 'Full-time' AFTER joiningDate");
      console.log('✅ Added employmentType column');
    }

    if (missingColumns.includes('workMode')) {
      await pool.execute("ALTER TABLE employee_profiles ADD COLUMN workMode ENUM('Remote', 'Hybrid', 'On-site') DEFAULT 'Hybrid' AFTER employmentType");
      console.log('✅ Added workMode column');
    }

    if (missingColumns.includes('skills')) {
      await pool.execute('ALTER TABLE employee_profiles ADD COLUMN skills JSON DEFAULT NULL AFTER workMode');
      console.log('✅ Added skills column');
    }

    if (missingColumns.includes('languages')) {
      await pool.execute('ALTER TABLE employee_profiles ADD COLUMN languages JSON DEFAULT NULL AFTER skills');
      console.log('✅ Added languages column');
    }

    if (missingColumns.includes('personalEmail')) {
      await pool.execute('ALTER TABLE employee_profiles ADD COLUMN personalEmail VARCHAR(255) DEFAULT NULL AFTER languages');
      console.log('✅ Added personalEmail column');
    }

    if (missingColumns.includes('bio')) {
      await pool.execute('ALTER TABLE employee_profiles ADD COLUMN bio TEXT DEFAULT NULL AFTER personalEmail');
      console.log('✅ Added bio column');
    }

    // Update existing records to have default values
    console.log('Updating existing records with default values...');
    await pool.execute(`
      UPDATE employee_profiles SET
        employmentType = 'Full-time',
        workMode = 'Hybrid'
      WHERE employmentType IS NULL OR workMode IS NULL
    `);
    console.log('✅ Updated existing records');

    console.log('✅ Employee profile fields migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error sqlMessage:', error.sqlMessage);
  } finally {
    process.exit(0);
  }
}

applyEmployeeProfileMigration();
