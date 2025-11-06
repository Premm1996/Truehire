// Script to create sample employee data for MySQL testing
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Tbdam@583225',
  database: process.env.DB_NAME || 'hireconnect_portal',
  port: process.env.DB_PORT || 3306
};

async function createSampleEmployees() {
  let connection;

  try {
    console.log('👥 Creating sample employee data for MySQL...\n');

    connection = await mysql.createConnection(dbConfig);

    // Sample employee data
    const employees = [
      {
        fullName: 'John Smith',
        email: 'john.smith@company.com',
        password: 'password123',
        mobile: '555-0101',
        role: 'employee',
        onboarding_status: 'COMPLETE',
        onboarding_step: 5
      },
      {
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        password: 'password123',
        mobile: '555-0102',
        role: 'employee',
        onboarding_status: 'IN_PROGRESS',
        onboarding_step: 3
      },
      {
        fullName: 'Mike Wilson',
        email: 'mike.wilson@company.com',
        password: 'password123',
        mobile: '555-0103',
        role: 'employee',
        onboarding_status: 'IN_PROGRESS',
        onboarding_step: 2
      },
      {
        fullName: 'Emily Davis',
        email: 'emily.davis@company.com',
        password: 'password123',
        mobile: '555-0104',
        role: 'employee',
        onboarding_status: 'NOT_STARTED',
        onboarding_step: 0
      },
      {
        fullName: 'David Brown',
        email: 'david.brown@company.com',
        password: 'password123',
        mobile: '555-0105',
        role: 'employee',
        onboarding_status: 'COMPLETE',
        onboarding_step: 5
      }
    ];

    // Create admin user if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const insertAdmin = `
      INSERT IGNORE INTO users (fullName, email, password, mobile, role, is_admin, onboarding_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertAdmin, ['Admin User', 'admin@company.com', hashedPassword, '555-0000', 'admin', 1, 'COMPLETE']);
    console.log('✅ Admin user created/updated');

    // Insert sample employees
    for (const employee of employees) {
      const empHashedPassword = await bcrypt.hash(employee.password, 10);

      const insertEmployee = `
        INSERT IGNORE INTO users (
          fullName, email, password, mobile, role, onboarding_status,
          onboarding_step, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertEmployee, [
        employee.fullName,
        employee.email,
        empHashedPassword,
        employee.mobile,
        employee.role,
        employee.onboarding_status,
        employee.onboarding_step,
        'active'
      ]);

      console.log(`✅ Created/updated employee: ${employee.fullName}`);
    }

    console.log('\n🎉 Sample data creation completed!');
    console.log('\n📋 Summary:');
    console.log('   - 1 Admin user created');
    console.log('   - 5 Employee users created');
    console.log('   - 2 Completed onboarding');
    console.log('   - 2 In Progress onboarding');
    console.log('   - 1 Not Started onboarding');

    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@company.com / admin123');
    console.log('   Employee: john.smith@company.com / password123');
    console.log('   Employee: sarah.johnson@company.com / password123');

  } catch (error) {
    console.error('❌ Error creating sample employees:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🔧 MySQL Sample Data Creation');
    console.log('📍 Host:', dbConfig.host);
    console.log('👤 User:', dbConfig.user);
    console.log('🗄️  Database:', dbConfig.database);
    console.log('');

    await createSampleEmployees();

    console.log('\n✅ Sample data creation completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createSampleEmployees };
