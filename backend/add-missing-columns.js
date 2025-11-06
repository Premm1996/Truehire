const pool = require('./db-fixed');

async function addMissingColumns() {
  try {
    console.log('🔄 Adding missing columns to employee_profiles table...');

    const alterStatements = [
      `ALTER TABLE employee_profiles ADD COLUMN department VARCHAR(255) DEFAULT NULL AFTER position`,
      `ALTER TABLE employee_profiles ADD COLUMN employmentType ENUM('Full-time', 'Contract', 'Part-time', 'Intern') DEFAULT 'Full-time' AFTER joiningDate`,
      `ALTER TABLE employee_profiles ADD COLUMN workMode ENUM('Remote', 'Hybrid', 'On-site') DEFAULT 'Hybrid' AFTER employmentType`,
      `ALTER TABLE employee_profiles ADD COLUMN skills JSON DEFAULT NULL AFTER workMode`,
      `ALTER TABLE employee_profiles ADD COLUMN languages JSON DEFAULT NULL AFTER skills`,
      `ALTER TABLE employee_profiles ADD COLUMN personalEmail VARCHAR(255) DEFAULT NULL AFTER languages`,
      `ALTER TABLE employee_profiles ADD COLUMN bio TEXT DEFAULT NULL AFTER personalEmail`
    ];

    for (const statement of alterStatements) {
      try {
        console.log(`🔄 Executing: ${statement.split('ADD COLUMN')[1].split(' ')[0]}...`);
        await pool.query(statement);
        console.log('✅ Column added successfully');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️ Column already exists, skipping...');
        } else {
          console.error('❌ Error adding column:', error.message);
        }
      }
    }

    console.log('✅ All missing columns processed!');

    // Verify the columns
    const [columns] = await pool.query('DESCRIBE employee_profiles');
    console.log('📊 Current columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    console.error('❌ Failed to add columns:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  addMissingColumns()
    .then(() => {
      console.log('🎉 Column addition completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Column addition failed:', error);
      process.exit(1);
    });
}

module.exports = addMissingColumns;
