const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runSQLScript() {
  try {
    console.log('🔄 Reading SQL script file...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'complete-updated-mysql-script-updated.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL file loaded successfully');
    console.log('🔄 Executing SQL script...');

    // Split the SQL content into individual statements
    // This is a simple split by semicolon, but it should work for our script
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
          // Log the error but continue with other statements
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('✅ SQL script execution completed!');

    // Verify tables were created
    console.log('📊 Verifying created tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📋 Tables in database:', tables.map(t => Object.values(t)[0]).join(', '));

    // Show record counts
    console.log('📊 Record counts:');
    const tableNames = [
      'users', 'employee_profiles', 'employees', 'onboarding_status',
      'onboarding_answers', 'audit_log', 'documents', 'activities',
      'job_postings', 'login_logs', 'account_logs', 'attendance_records',
      'attendance_holidays', 'attendance_corrections', 'attendance_settings',
      'offer_letters', 'candidate_progress', 'admin_setup', 'system_monitoring'
    ];

    for (const tableName of tableNames) {
      try {
        const [count] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  ${tableName}: ${count[0].count} records`);
      } catch (error) {
        console.log(`  ${tableName}: Table not found or error`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to execute SQL script:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  runSQLScript()
    .then(() => {
      console.log('🎉 Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = runSQLScript;
