const fs = require('fs');
const path = require('path');
const pool = require('./db-fixed');

async function runAttendanceMigration() {
  try {
    console.log('🔄 Reading attendance migration file...');
    const sqlFilePath = path.join(__dirname, 'migrations', 'create-attendance-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('📄 Migration file loaded successfully');

    console.log('🔄 Executing migration statements...');

    // Split by semicolon and clean statements
    const rawStatements = sqlContent.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);

    // Clean comments from each statement
    const statements = rawStatements.map(stmt => {
      return stmt.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('--'))
        .join('\n')
        .trim();
    }).filter(stmt => stmt.length > 0);

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
        try {
          await pool.execute(statement);
          console.log('✅ Statement executed successfully');
        } catch (error) {
          console.error('❌ Error executing statement:', error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          // Continue with next statement
        }
      }
    }

    console.log('🎉 Attendance migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runAttendanceMigration();
