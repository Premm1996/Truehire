require('dotenv').config();
const mysql = require('mysql2/promise');

async function createLeavePoliciesTable() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Tbdam@583225',
      database: process.env.DB_NAME || 'hireconnect',
      port: process.env.DB_PORT || 3306,
    });

    console.log('Connected to database');

    // Create attendance_leave_policies table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS attendance_leave_policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        leave_type ENUM('annual', 'sick', 'casual', 'maternity', 'paternity') NOT NULL UNIQUE,
        annual_allocation DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        monthly_accrual DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        max_carry_forward DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        max_consecutive_days INT NOT NULL DEFAULT 0,
        notice_period_days INT NOT NULL DEFAULT 0,
        requires_documentation BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('Leave policies table created successfully');

    // Insert default leave policies
    const defaultPolicies = [
      {
        leave_type: 'annual',
        annual_allocation: 12.00,
        monthly_accrual: 1.00,
        max_carry_forward: 6.00,
        max_consecutive_days: 15,
        notice_period_days: 7,
        requires_documentation: false,
        is_active: true
      },
      {
        leave_type: 'sick',
        annual_allocation: 6.00,
        monthly_accrual: 0.50,
        max_carry_forward: 3.00,
        max_consecutive_days: 3,
        notice_period_days: 1,
        requires_documentation: true,
        is_active: true
      },
      {
        leave_type: 'casual',
        annual_allocation: 6.00,
        monthly_accrual: 0.50,
        max_carry_forward: 0.00,
        max_consecutive_days: 3,
        notice_period_days: 1,
        requires_documentation: false,
        is_active: true
      },
      {
        leave_type: 'maternity',
        annual_allocation: 84.00,
        monthly_accrual: 0.00,
        max_carry_forward: 0.00,
        max_consecutive_days: 84,
        notice_period_days: 30,
        requires_documentation: true,
        is_active: true
      },
      {
        leave_type: 'paternity',
        annual_allocation: 5.00,
        monthly_accrual: 0.00,
        max_carry_forward: 0.00,
        max_consecutive_days: 5,
        notice_period_days: 7,
        requires_documentation: true,
        is_active: true
      }
    ];

    // Check if data already exists
    const [existingRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM attendance_leave_policies'
    );

    if (existingRows[0].count === 0) {
      // Insert default policies
      const insertQuery = `
        INSERT INTO attendance_leave_policies
        (leave_type, annual_allocation, monthly_accrual, max_carry_forward, max_consecutive_days, notice_period_days, requires_documentation, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const policy of defaultPolicies) {
        await connection.execute(insertQuery, [
          policy.leave_type,
          policy.annual_allocation,
          policy.monthly_accrual,
          policy.max_carry_forward,
          policy.max_consecutive_days,
          policy.notice_period_days,
          policy.requires_documentation,
          policy.is_active
        ]);
      }

      console.log('Default leave policies inserted successfully');
    } else {
      console.log('Leave policies already exist, skipping insertion');
    }

    console.log('Leave policies migration completed successfully');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
createLeavePoliciesTable()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
