const fs = require('fs');
const path = require('path');
const pool = require('./db-fixed');

async function addCandidateProfilesTable() {
  try {
    console.log('🔄 Reading SQL script file...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'add-candidate-profiles-table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL file loaded successfully');
    console.log('🔄 Executing SQL script...');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
          await pool.query(statement);
        } catch (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('✅ SQL script execution completed!');

    // Verify table was created
    console.log('📊 Verifying candidate_profiles table...');
    const [tables] = await pool.query('SHOW TABLES LIKE "candidate_profiles"');
    if (tables.length > 0) {
      console.log('✅ candidate_profiles table exists!');
    } else {
      console.log('❌ candidate_profiles table not found');
    }

  } catch (error) {
    console.error('❌ Failed to execute SQL script:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  addCandidateProfilesTable()
    .then(() => {
      console.log('🎉 candidate_profiles table added successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to add candidate_profiles table:', error);
      process.exit(1);
    });
}

module.exports = addCandidateProfilesTable;
