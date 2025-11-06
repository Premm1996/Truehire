const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  console.log('🔧 Applying updated MySQL schema...');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tbdam@583225',
    database: 'hireconnect_portal',
    multipleStatements: true
  });

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'complete-updated-mysql-script-updated.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split the SQL into individual statements
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await connection.execute(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} failed (might be expected):`, err.message);
        }
      }
    }

    console.log('🎉 Schema application completed!');

    // Verify tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Current tables:', tables.map(row => Object.values(row)[0]));

  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
  } finally {
    await connection.end();
  }
}

applySchema();
