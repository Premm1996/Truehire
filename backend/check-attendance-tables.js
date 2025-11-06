const pool = require('./db-fixed');

async function checkAttendanceTables() {
  try {
    console.log('Checking attendance-related tables...');

    const tables = ['projects', 'breaks', 'timesheets', 'leaves', 'attendance_audit'];

    for (const table of tables) {
      try {
        const [rows] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`✅ Table '${table}' exists`);

          // Get table structure
          const [columns] = await pool.execute(`DESCRIBE ${table}`);
          console.log(`   Columns: ${columns.map(col => col.Field).join(', ')}`);
        } else {
          console.log(`❌ Table '${table}' does not exist`);
        }
      } catch (error) {
        console.error(`Error checking table '${table}':`, error.message);
      }
    }

    // Check attendance_records columns
    console.log('\nChecking attendance_records table columns...');
    const [columns] = await pool.execute('DESCRIBE attendance_records');
    const columnNames = columns.map(col => col.Field);
    console.log('attendance_records columns:', columnNames.join(', '));

    const requiredColumns = ['punch_in_at', 'punch_out_at', 'total_hours', 'overtime_hours', 'status', 'updated_at'];
    for (const col of requiredColumns) {
      if (columnNames.includes(col)) {
        console.log(`✅ Column '${col}' exists in attendance_records`);
      } else {
        console.log(`❌ Column '${col}' missing in attendance_records`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkAttendanceTables();
