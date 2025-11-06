const pool = require('./db');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [result] = await pool.query('SELECT 1 as test');
    console.log('✅ Basic connection test:', result[0]);
    
    // Check if database exists
    const [databases] = await pool.query('SHOW DATABASES');
    console.log('📊 Available databases:', databases.map(db => db.Database));
    
    // Use the student_portal database
    await pool.query('USE student_portal');
    console.log('✅ Using student_portal database');
    
    // Check if tables exist
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(table => Object.values(table)[0]));
    
    // Check users table
    try {
      const [users] = await pool.query('SELECT COUNT(*) as userCount FROM users');
      console.log('👥 Users in database:', users[0].userCount);
      
      if (users[0].userCount > 0) {
        const [userList] = await pool.query('SELECT id, email, role, createdAt FROM users LIMIT 5');
        console.log('👥 Sample users:', userList);
      }
    } catch (error) {
      console.log('⚠️ Users table might not exist:', error.message);
    }
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabase();
