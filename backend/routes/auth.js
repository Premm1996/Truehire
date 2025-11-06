const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db').pool;

// Register new user
router.post('/register', async (req, res) => {
  try {
    let {
      fullName,
      email,
      password,
      mobile,
      role,
      termsAgreed,
      // New fields from enhanced registration
      dob,
      gender,
      nationality,
      position,
      department,
      joiningDate,
      employmentType,
      workMode,
      skills,
      languages,
      personalEmail,
      bio,
      linkedin,
      profileData,
      photo
    } = req.body;

    // Debug log
    console.log('Register payload:', req.body);

    const validRoles = ['candidate', 'employee'];
    if (!role || !validRoles.includes(role)) {
      console.warn('Registration failed: Invalid role', role);
      return res.status(400).json({ error: 'Invalid role. Please select candidate or employee.' });
    }

    // Validate input
    if (!email || !password || !fullName) {
      console.warn('Registration failed: Missing required fields');
      return res.status(400).json({
        message: 'Missing required fields',
        details: 'Please provide email, password, and full name'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('Registration failed: Invalid email format');
      return res.status(400).json({
        message: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.warn('Registration failed: Weak password');
      return res.status(400).json({
        message: 'Weak password',
        details: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existingUser.length > 0) {
      console.warn('Registration failed: Email already registered');
      return res.status(400).json({
        message: 'Email already registered',
        details: 'User already exists with this email address'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Helper function to format date for MySQL DATE type
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return null;
      try {
        // Handle ISO format: '2005-01-15T00:00:00.000Z' -> '2005-01-15'
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        // Format as YYYY-MM-DD for MySQL DATE type
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Date conversion error:', error);
        return null;
      }
    };

    // Prepare comprehensive profile data
    let profileDataToStore = { fullName, mobile, termsAgreed };

    // Merge with additional profile data if provided
    if (profileData) {
      profileDataToStore = { ...profileDataToStore, ...profileData };
    }

    // Handle photo upload if provided
    let photoPath = null;
    if (photo) {
      try {
        // If photo is a base64 string, upload to S3
        if (typeof photo === 'string' && photo.startsWith('data:')) {
          const { uploadProfilePhoto } = require('../config/s3');

          // Upload to S3 (will be called after user is created to get userId)
          photoPath = 'pending_s3_upload';
          profileDataToStore.photo = photoPath;
        }
      } catch (photoError) {
        console.error('Error preparing photo upload:', photoError);
        // Continue with registration even if photo upload fails
      }
    }

    // Insert user into database - ALL new accounts require admin approval
    try {
      const [result] = await pool.query(
        `INSERT INTO users (fullName, email, mobile, password, role, is_admin, profile, onboarding_step, onboarding_status, approved, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, NOW(), NOW())`,
        [
          fullName,
          email,
          mobile,
          hashedPassword,
          role,
          JSON.stringify(profileDataToStore),
          0,
          'NOT_STARTED',
          0 // Set approved = false for ALL new accounts (require admin approval)
        ]
      );

      const userId = result.insertId;
      console.log('Registration SQL result:', userId);

      if (userId) {
        // Create employee profile with comprehensive data for employees
        if (role === 'employee') {
          try {
            await pool.query(
              `INSERT INTO employee_profiles (
                user_id, fullName, email, mobile, dob, gender, nationality,
                position, joiningDate, employmentType, workMode,
                skills, languages, personalEmail, bio, linkedin, photo
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE fullName = VALUES(fullName), email = VALUES(email), mobile = VALUES(mobile)`,
              [
                userId,
                fullName,
                email,
                mobile,
                formatDateForMySQL(dob),
                gender || null,
                nationality || null,
                position || null,
                formatDateForMySQL(joiningDate),
                employmentType || 'Full-time',
                workMode || 'Hybrid',
                skills ? JSON.stringify(skills) : null,
                languages ? JSON.stringify(languages) : null,
                personalEmail || null,
                bio || null,
                linkedin || null,
                photoPath
              ]
            );
            console.log('Employee profile created successfully');
          } catch (profileError) {
            console.error('Error creating employee profile:', profileError);
            console.error('Profile creation error details:', {
              code: profileError.code,
              errno: profileError.errno,
              sqlState: profileError.sqlState,
              sqlMessage: profileError.sqlMessage
            });
            // Continue even if profile creation fails
          }
        }

        // Upload photo to S3 if provided
        if (photo && photoPath === 'pending_s3_upload') {
          try {
            const { uploadProfilePhoto } = require('../config/s3');
            const s3Url = await uploadProfilePhoto(photo, userId);

            // Update user profile with S3 URL
            const updatedProfile = { ...profileDataToStore, photo: s3Url };
            await pool.query('UPDATE users SET profile = ? WHERE id = ?', [JSON.stringify(updatedProfile), userId]);

            // Update employee profile with S3 URL if employee
            if (role === 'employee') {
              await pool.query('UPDATE employee_profiles SET photo = ? WHERE user_id = ?', [s3Url, userId]);
            }

            profileDataToStore.photo = s3Url;
            console.log('Photo uploaded to S3 successfully:', s3Url);
          } catch (s3Error) {
            console.error('Error uploading photo to S3:', s3Error);
            // Continue with registration even if S3 upload fails
          }
        }

        return res.status(201).json({
          message: 'User created successfully',
          userId: userId,
          email,
          role,
          profileData: profileDataToStore
        });
      } else {
        console.error('Insert did not return insertId');
        return res.status(500).json({ message: 'Failed to create user' });
      }
    } catch (err) {
      console.error('Error inserting user into DB:', err);
      // Check for duplicate email error (MySQL uses ER_DUP_ENTRY)
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already registered' });
      }
      // Return SQL error message for debugging
      return res.status(400).json({ message: 'Database error during registration', details: err.message });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', details: error.message });
  }
});

// Login user
const logger = require('../utils/logger');

router.post('/login', async (req, res) => {
  logger.info('Request received: %s %s', req.method, req.path);
  logger.info('🔐 Login attempt started for email: %s', req.body.email);
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      logger.warn('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    logger.info('✅ Input validation passed');

    // Find user by email (case-insensitive)
    let [userRows] = [];
    try {
      logger.info('🔍 Querying database for user...');
      [userRows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
      const user = userRows[0];
      logger.info('✅ Database query successful, user found: %s', !!user);
    } catch (dbError) {
      logger.error('❌ Database query error during login: %O', dbError);
      return res.status(500).json({ message: 'Database error during login', details: dbError.message });
    }

    const user = userRows[0];
    if (!user) {
      logger.warn('Login failed: No user found for email=%s', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    logger.info('👤 User found: %o', { id: user.id, email: user.email, role: user.role });

    // Check password
    logger.info('🔑 Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Login failed: Password mismatch for user id=%d', user.id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    logger.info('✅ Password valid');

    // Check if user is admin (either by role or is_admin flag)
    const isAdmin = user.is_admin === 1 || user.role === 'admin';
    logger.info('👑 Admin check: %o', { isAdmin, role: user.role, is_admin: user.is_admin });

    // Check if user is approved (for non-admin users)
    if (!isAdmin && user.approved === 0) {
      logger.warn('Login failed: User account not approved, user id=%d', user.id);
      return res.status(403).json({
        message: 'Account pending approval',
        details: 'Your account is waiting for admin approval. Please contact your administrator.'
      });
    }
    logger.info('✅ Approval check passed');

    // For non-admin users, allow employee and candidate roles
    if (!isAdmin && user.role !== 'employee' && user.role !== 'candidate') {
      logger.warn('Login failed: User role %s not allowed for login', user.role);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    logger.info('✅ Role validation passed');

    // Check if user has employee profile (only for employees)
    let hasProfile = false;
    if (user.role === 'employee') {
      try {
        logger.info('📋 Checking employee profile...');
        const [employeeProfiles] = await pool.query('SELECT id FROM employee_profiles WHERE user_id = ?', [user.id]);
        hasProfile = employeeProfiles.length > 0;
        logger.info('✅ Employee profile check: %s', hasProfile);
      } catch (profileError) {
        logger.error('❌ Database query error during employee profile check: %O', profileError);
        // If table doesn't exist or query fails, assume no profile to avoid 500 error
        hasProfile = false;
        logger.warn('⚠️ Employee profile check failed, assuming no profile');
      }
    }

    // Check onboarding status from users table
    let onboardingStep = user.onboarding_step || 0;
    let onboardingStatus = user.onboarding_status || 'NOT_STARTED';
    logger.info('📝 Onboarding status: %o', { onboardingStep, onboardingStatus });

    // Generate JWT token with validated secret
    logger.info('🔐 Generating JWT token...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('❌ JWT_SECRET environment variable is required');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    logger.info('🔍 JWT_SECRET is set (masked): %s', '*'.repeat(Math.min(jwtSecret.length, 8)));

    let token;
    try {
      token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '24h' }
      );
      logger.info('✅ JWT token generated successfully');
    } catch (jwtError) {
      logger.error('❌ JWT token generation error: %O', jwtError);
      return res.status(500).json({ message: 'JWT token generation failed', details: jwtError.message });
    }

    // Determine redirect URL based on role and onboarding status
    let redirectUrl = '/employee-dashboard/profile';
    if (isAdmin) {
      redirectUrl = '/admin/dashboard';
    } else if (user.role === 'employee' || user.role === 'candidate') {
      if (onboardingStatus === 'NOT_STARTED') {
        // New user - redirect to registration process
        redirectUrl = '/employee-registration-process';
      } else if (onboardingStatus === 'COMPLETE') {
        // Completed onboarding - redirect to dashboard
        redirectUrl = `/employee-dashboard/${user.id}`;
      } else {
        // In progress or any other status - redirect to registration
        redirectUrl = '/employee-registration-process';
      }
    }

    const responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_admin: isAdmin,
        hasProfile,
        onboardingStep: user.onboarding_step || 0,
        onboardingStatus: user.onboarding_status || 'NOT_STARTED',
        candidateId: user.id, // Add candidateId for onboarding form compatibility
        redirectUrl // Add redirect URL based on onboarding status
      }
    };

    logger.info('🎉 Login successful for user: %s', user.email);
    logger.info('Redirect URL: %s', redirectUrl);
    res.json(responseData);
  } catch (error) {
    logger.error('❌ Unexpected login error: %O', error);
    logger.error('Error stack: %s', error.stack);
    logger.error('Error code: %s', error.code);
    logger.error('Error errno: %s', error.errno);
    logger.error('Error sqlState: %s', error.sqlState);
    logger.error('Error sqlMessage: %s', error.sqlMessage);
    res.status(500).json({
      message: 'Server error during login',
      details: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
});


    // Get all users (for testing)
    router.get('/users', async (req, res) => {
      try {
        const [users] = await pool.query('SELECT id, email, role, createdAt FROM users ORDER BY createdAt DESC');
        res.json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Test database connection
    router.get('/test-db', async (req, res) => {
      try {
        const [result] = await pool.query('SELECT 1 as test');
        res.json({ message: 'Database connection successful', test: result[0] });
      } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'Database connection failed', error: error.message });
      }
    });

module.exports = router;
