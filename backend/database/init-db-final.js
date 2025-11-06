const pool = require('../backend/db');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Create users table with existing schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        termsAgreed BOOLEAN DEFAULT FALSE,
        role ENUM('student', 'admin', 'recruiter') DEFAULT 'student',
        profile TEXT,
        isVerified BOOLEAN DEFAULT FALSE,
        verificationToken VARCHAR(255),
        resetPasswordToken VARCHAR(255),
        resetPasswordExpire DATETIME,
        lastLogin DATETIME,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create onboarding_status table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS onboarding_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        current_step ENUM(
          'NOT_STARTED',
          'PROFILE_FILLED',
          'INTERVIEW_SCHEDULED',
        'INTERVIEW_ROUND_1',
        'INTERVIEW_ROUND_2',
        'INTERVIEW_ROUND_3',
        'INTERVIEW_PASSED',
        'INTERVIEW_FAILED',
        'DOCS_UPLOADED',
        'OFFER_LETTER_UPLOADED',
        'OFFER_SIGNED',
        'ID_CARD_GENERATED',
        'COMPLETED'
        ) DEFAULT 'NOT_STARTED',
        interview_failed_at TIMESTAMP NULL,
        interview_retry_after TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create candidate_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidate_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        date_of_birth DATE,
        education_level VARCHAR(100),
        experience_years INT DEFAULT 0,
        skills TEXT,
        resume_url VARCHAR(500),
        profile_picture_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create indexes
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    } catch {
      // Index might already exist
    }

    // Insert sample admin user
    await pool.query(`
      INSERT IGNORE INTO users (fullName, email, password, mobile, role, termsAgreed, isVerified)
      VALUES ('Admin User', 'admin@hireconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0000000000', 'admin', TRUE, TRUE)
    `);

    // Insert sample recruiter user
    await pool.query(`
      INSERT IGNORE INTO users (fullName, email, password, mobile, role, termsAgreed, isVerified)
      VALUES ('Recruiter User', 'recruiter@hireconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1111111111', 'recruiter', TRUE, TRUE)
    `);

    console.log('✅ Database initialized successfully!');
    
    // Show table structure
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📊 Tables created:', tables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run initialization if called directly
    // Handle the error appropriately
  

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
