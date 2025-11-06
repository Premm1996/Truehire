const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyFix() {
  console.log('🔧 Applying onboarding_answers table fix...');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tbdam@583225',
    database: 'hireconnect_portal',
    multipleStatements: true
  });

  try {
    // Read the fix file
    const fixPath = path.join(__dirname, 'database', 'production-ready-mysql-fix.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');

    console.log('📋 Fix SQL to execute:', fixSQL);

    // Execute the fix
    await connection.execute(fixSQL);
    console.log('✅ onboarding_answers table created successfully!');

    // Verify the table was created
    const [tables] = await connection.execute('SHOW TABLES LIKE "onboarding_answers"');
    if (tables.length > 0) {
      console.log('🎉 onboarding_answers table verified!');
    } else {
      console.log('⚠️ Table creation might have failed');
    }

  } catch (error) {
    console.error('❌ Fix application failed:', error.message);
  } finally {
    await connection.end();
  }
}

applyFix();
