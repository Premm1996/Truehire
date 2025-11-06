const fs = require('fs');
const pool = require('./db-fixed');

async function applyFixAttendanceBreaksMigration() {
  try {
    console.log('Applying fix attendance breaks columns migration...');

    const sqlContent = fs.readFileSync('./migrations/fix-attendance-breaks-columns.sql', 'utf8');
    console.log('SQL file loaded');

    // Split by semicolon and filter out empty statements and comments
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      try {
        await pool.execute(statement);
        console.log('✅ Statement executed successfully');
      } catch (error) {
        console.error('❌ Error executing statement:', error.message);
        console.error('Statement:', statement);
        // Continue with next statement
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

applyFixAttendanceBreaksMigration();
