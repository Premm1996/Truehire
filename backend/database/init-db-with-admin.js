const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabaseWithAdmin() {
  let connection;

  try {
    console.log('🔄 Initializing database with complete schema and admin user...');

    // Database configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Tbdam@583225',
      database: process.env.DB_NAME || 'hireconnect_portal',
      multipleStatements: true
    };

    // Create connection
    connection = await mysql.createConnection(dbConfig);

    // Read the complete schema file
    const schemaPath = path.join(__dirname, '../../complete-updated-mysql-script-updated.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📥 Loading complete database schema...');

    // Execute the complete schema
    await connection.execute(schemaSQL);

    console.log('✅ Database schema initialized successfully!');

    // Verify admin user exists (the schema already creates it)
    const [adminUsers] = await connection.execute(
      'SELECT id, email, role, is_admin FROM users WHERE email = ?',
      ['admin@truerize.com']
    );

    if (adminUsers.length > 0) {
      console.log('👑 Admin user verified:');
      console.log('   Email: admin@truerize.com');
      console.log('   Password: Tbdam@583225');
      console.log('   Role: admin');
      console.log('   Is Admin:', adminUsers[0].is_admin);
    } else {
      console.log('⚠️  Admin user not found, creating manually...');

      // Fallback: Create admin user manually if schema didn't create it
      await connection.execute(`
        INSERT INTO users (
          fullName,
          email,
          password,
          mobile,
          role,
          is_admin,
          termsAgreed,
          isVerified,
          status
        ) VALUES (
          'System Administrator',
          'admin@truerize.com',
          '$2a$10$voDUPosIXmZqsBHpF3kWMOw9QW99Wtbfx9NiN7S8elhWr2NlVDtce',
          '0000000000',
          'admin',
          TRUE,
          TRUE,
          TRUE,
          'active'
        ) ON DUPLICATE KEY UPDATE
          fullName = VALUES(fullName),
          password = VALUES(password),
          role = VALUES(role),
          is_admin = TRUE,
          isVerified = TRUE
      `);

      console.log('✅ Admin user created successfully!');
    }

    // Show database summary
    const [tableCount] = await connection.execute(`
      SELECT COUNT(*) as total_tables
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [dbConfig.database]);

    const [userCount] = await connection.execute('SELECT COUNT(*) as total_users FROM users');

    console.log('📊 Database Summary:');
    console.log(`   • Tables: ${tableCount[0].total_tables}`);
    console.log(`   • Users: ${userCount[0].total_users}`);
    console.log(`   • Database: ${dbConfig.database}`);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabaseWithAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabaseWithAdmin;
