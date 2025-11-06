const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnose() {
  console.log('🔍 Running Complete Diagnostics...\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Tbdam@583225',
      database: process.env.DB_NAME || 'hireconnect_portal'
    });

    console.log('✅ Database Connected\n');

    // 1. Check attendance_records columns
    console.log('📋 Checking attendance_records columns...');
    const [columns] = await connection.execute('DESCRIBE attendance_records');
    const columnNames = columns.map(c => c.Field);

    const requiredColumns = [
      'id', 'user_id', 'date', 'punch_in_time', 'punch_out_time',
      'total_hours', 'production_hours', 'break_duration', 'status'
    ];

    const missingColumns = [];
    for (const col of requiredColumns) {
      if (columnNames.includes(col)) {
        console.log(`  ✅ ${col}`);
      } else {
        console.log(`  ❌ ${col} - MISSING!`);
        missingColumns.push(col);
      }
    }

    if (missingColumns.length > 0) {
      console.log('\⚠  MISSING COLUMNS DETECTED!');
      console.log('\nRun this SQL to fix:');
      console.log('----------------------------------------');
      if (missingColumns.includes('break_duration')) {
        console.log('ALTER TABLE attendance_records ADD COLUMN break_duration DECIMAL(5,2) DEFAULT 0;');
      }
      if (missingColumns.includes('production_hours')) {
        console.log('ALTER TABLE attendance_records ADD COLUMN production_hours DECIMAL(5,2) DEFAULT 0;');
      }
      console.log('----------------------------------------\n');
    }

    // 2. Check attendance_breaks table
    console.log('\n📋 Checking attendance_breaks table...');
    const [breakCols] = await connection.execute('DESCRIBE attendance_breaks');
    const breakColNames = breakCols.map(c => c.Field);

    const requiredBreakCols = [
      'id', 'user_id', 'break_start_time', 'break_end_time',
      'duration_minutes', 'status'
    ];

    for (const col of requiredBreakCols) {
      if (breakColNames.includes(col)) {
        console.log(`  ✅ ${col}`);
      } else {
        console.log(`  ❌ ${col} - MISSING!`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

diagnose();
