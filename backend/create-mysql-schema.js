const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Tbdam@583225',
  database: process.env.DB_NAME || 'hireconnect_portal',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

// Create database if it doesn't exist
async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port
  });

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' created or already exists`);
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  } finally {
    await connection.end();
  }
}

// Initialize database with tables
async function initializeDatabase() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🚀 Initializing MySQL database schema...\n');

    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) DEFAULT '',
        termsAgreed BOOLEAN DEFAULT 1,
        role VARCHAR(50) DEFAULT 'employee',
        is_admin BOOLEAN DEFAULT 0,
        companyName VARCHAR(255),
        profile JSON,
        isVerified BOOLEAN DEFAULT 1,
        verificationToken VARCHAR(255),
        resetPasswordToken VARCHAR(255),
        resetPasswordExpire DATETIME,
        lastLogin DATETIME,
        status VARCHAR(50) DEFAULT 'active',
        onboarding_step INT DEFAULT 0,
        onboarding_status VARCHAR(50) DEFAULT 'NOT_STARTED',
        offer_letter_uploaded BOOLEAN DEFAULT 0,
        offer_letter_url VARCHAR(500),
        id_card_generated BOOLEAN DEFAULT 0,
        last_step_completed_at DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Employees table
      `CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        position VARCHAR(255),
        department VARCHAR(255),
        status VARCHAR(50) DEFAULT 'NOT_STARTED',
        onboarding_step INT DEFAULT 0,
        offerLetterUploaded BOOLEAN DEFAULT 0,
        idCardGenerated BOOLEAN DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Admin setup table
      `CREATE TABLE IF NOT EXISTS admin_setup (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_email VARCHAR(255) UNIQUE NOT NULL,
        admin_password VARCHAR(255) NOT NULL,
        setup_completed BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Documents table
      `CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        document_type VARCHAR(100),
        file_name VARCHAR(500),
        file_path VARCHAR(500),
        file_size BIGINT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        approved_at DATETIME,
        approved_by INT,
        remarks TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_type (user_id, document_type)
      )`,

      // Onboarding answers table
      `CREATE TABLE IF NOT EXISTS onboarding_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        question_id VARCHAR(100),
        answer TEXT,
        step INT,
        data JSON,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_step (user_id, step)
      )`,

      // Audit log table
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        admin_id INT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_action (user_id, action),
        INDEX idx_created_at (created_at)
      )`,

      // Attendance table
      `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        date DATE,
        status VARCHAR(50),
        check_in_time TIME,
        check_out_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date),
        UNIQUE KEY unique_user_date (user_id, date)
      )`,

      // Employee profiles table (extended profile data)
      `CREATE TABLE IF NOT EXISTS employee_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE,
        fullName VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(20),
        dob DATE,
        gender VARCHAR(20),
        nationality VARCHAR(100),
        qualification VARCHAR(255),
        specialization VARCHAR(255),
        college VARCHAR(255),
        graduationYear INT,
        cgpa DECIMAL(4,2),
        position VARCHAR(255),
        experience VARCHAR(100),
        expectedSalary VARCHAR(100),
        location VARCHAR(255),
        accountNumber VARCHAR(100),
        ifscCode VARCHAR(20),
        bankName VARCHAR(255),
        personalEmail VARCHAR(255),
        mobileNumber VARCHAR(20),
        workLocation VARCHAR(255),
        jobTitle VARCHAR(255),
        dateOfJoining DATE,
        photo VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )`
    ];

    // Execute table creation
    for (let i = 0; i < tables.length; i++) {
      try {
        await connection.execute(tables[i]);
        console.log(`✅ Table ${i + 1} created successfully`);
      } catch (error) {
        console.error(`❌ Error creating table ${i + 1}:`, error.message);
      }
    }

    // Insert default admin user
    try {
      const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
      const insertAdmin = `
        INSERT IGNORE INTO admin_setup (admin_email, admin_password, setup_completed)
        VALUES (?, ?, 1)
      `;
      await connection.execute(insertAdmin, ['admin@hireconnect.com', hashedPassword]);
      console.log('✅ Default admin user created');
    } catch (error) {
      console.error('❌ Error inserting admin user:', error.message);
    }

    console.log('\n🎉 Database schema initialization completed!');
    console.log('📊 Database:', dbConfig.database);
    console.log('🏗️  Tables created:', tables.length);

  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    await connection.end();
  }
}

// Main execution
async function main() {
  try {
    console.log('🔧 MySQL Database Setup');
    console.log('📍 Host:', dbConfig.host);
    console.log('👤 User:', dbConfig.user);
    console.log('🗄️  Database:', dbConfig.database);
    console.log('');

    await createDatabaseIfNotExists();
    await initializeDatabase();

    console.log('\n✅ MySQL database setup completed successfully!');
    console.log('🚀 You can now run your application with MySQL database.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { initializeDatabase, createDatabaseIfNotExists };
