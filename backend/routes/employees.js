const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { generalLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { pool } = require('../db');

// Apply rate limiting to all routes
router.use(generalLimiter);

// Public routes
router.get('/', employeeController.getEmployees);
router.get('/stats', employeeController.getEmployeeStats);
router.get('/:id', employeeController.getEmployeeById);

// Protected routes (require authentication)
router.post('/', authenticateToken, employeeController.createEmployee);
router.put('/:id/status', authenticateToken, employeeController.updateEmployeeStatus);
router.delete('/:id', authenticateToken, employeeController.deleteEmployee);

// Document upload routes
router.post('/:id/documents', authenticateToken, upload.fields([
  { name: 'marks10', maxCount: 1 },
  { name: 'marks12', maxCount: 1 },
  { name: 'diploma', maxCount: 1 },
  { name: 'semMarks', maxCount: 1 },
  { name: 'degreeCert', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'secondaryId', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'offerLetter', maxCount: 5 },
  { name: 'relievingLetter', maxCount: 5 },
  { name: 'salarySlips', maxCount: 3 },
  { name: 'experienceCert', maxCount: 5 },
  { name: 'bankProof', maxCount: 1 }
]), handleUploadError, employeeController.uploadDocuments);

router.get('/:id/documents', authenticateToken, employeeController.getEmployeeDocuments);

// Profile update route
router.put('/:id/profile', authenticateToken, employeeController.updateEmployeeProfile);

// Employee dashboard route
router.get('/:id/dashboard', authenticateToken, employeeController.getEmployeeDashboard);

// Enhanced profile update endpoint for current user
router.put('/profile/enhanced', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.id;

    const {
      fullName,
      mobile,
      dob,
      gender,
      nationality,
      qualification,
      specialization,
      college,
      graduationYear,
      cgpa,
      expectedSalary,
      location,
      personalEmail,
      jobTitle,
      mobileNumber,
      accountNumber,
      ifscCode,
      bankName,
      dateOfJoining,
      workLocation,
      experience,
      department
    } = req.body;

    // Update users table with existing columns plus position and department
    await pool.query(
      'UPDATE users SET fullName = ?, mobile = ?, position = ?, department = ?, updatedAt = NOW() WHERE id = ?',
      [fullName, mobile, jobTitle, department, employeeId]
    );

    // Convert ISO date format to MySQL DATE format (YYYY-MM-DD)
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

    // Update employee_profiles table with all profile data
    await pool.query(
      `INSERT INTO employee_profiles (user_id, dob, gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location, position, experience)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       dob = VALUES(dob), gender = VALUES(gender), nationality = VALUES(nationality),
       qualification = VALUES(qualification), specialization = VALUES(specialization),
       college = VALUES(college), graduationYear = VALUES(graduationYear),
       cgpa = VALUES(cgpa), expectedSalary = VALUES(expectedSalary), location = VALUES(location),
       position = VALUES(position), experience = VALUES(experience)`,
      [employeeId, formatDateForMySQL(dob), gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location, jobTitle, experience]
    );

    // Update onboarding answers with latest data
    const onboardingData = {
      fullName,
      personalEmail,
      jobTitle,
      mobileNumber,
      accountNumber,
      ifscCode,
      bankName,
      dateOfJoining,
      workLocation,
      experience,
      dob,
      gender,
      nationality,
      qualification,
      specialization,
      college,
      graduationYear,
      cgpa,
      expectedSalary,
      workLocation: location
    };

    await pool.query(
      'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, 1, ?, NOW()) ON DUPLICATE KEY UPDATE data = ?, submitted_at = NOW()',
      [employeeId, JSON.stringify(onboardingData), JSON.stringify(onboardingData)]
    );

    // Log the profile update
    console.log(`✅ Profile updated for employee ${employeeId} by user ${req.user.id}`);

    res.json({
      message: 'Profile updated successfully',
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Enhanced profile update endpoint
router.put('/:id/profile/enhanced', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is updating their own profile or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      fullName,
      mobile,
      dob,
      gender,
      nationality,
      qualification,
      specialization,
      college,
      graduationYear,
      cgpa,
      expectedSalary,
      location,
      personalEmail,
      jobTitle,
      mobileNumber,
      accountNumber,
      ifscCode,
      bankName,
      dateOfJoining,
      workLocation,
      experience
    } = req.body;

    // Update users table with existing columns plus position and department
    await pool.query(
      'UPDATE users SET fullName = ?, mobile = ?, position = ?, department = ?, updatedAt = NOW() WHERE id = ?',
      [fullName, mobile, jobTitle, department, employeeId]
    );

    // Convert ISO date format to MySQL DATE format (YYYY-MM-DD)
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

    // Update employee_profiles table with all profile data
    await pool.query(
      `INSERT INTO employee_profiles (user_id, dob, gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location, position, experience)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       dob = VALUES(dob), gender = VALUES(gender), nationality = VALUES(nationality),
       qualification = VALUES(qualification), specialization = VALUES(specialization),
       college = VALUES(college), graduationYear = VALUES(graduationYear),
       cgpa = VALUES(cgpa), expectedSalary = VALUES(expectedSalary), location = VALUES(location),
       position = VALUES(position), experience = VALUES(experience)`,
      [employeeId, formatDateForMySQL(dob), gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location, jobTitle, experience]
    );

    // Update onboarding answers with latest data
    const onboardingData = {
      fullName,
      personalEmail,
      jobTitle,
      mobileNumber,
      accountNumber,
      ifscCode,
      bankName,
      dateOfJoining,
      workLocation,
      experience,
      dob,
      gender,
      nationality,
      qualification,
      specialization,
      college,
      graduationYear,
      cgpa,
      expectedSalary,
      workLocation: location
    };

    await pool.query(
      'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, 1, ?, NOW()) ON DUPLICATE KEY UPDATE data = ?, submitted_at = NOW()',
      [employeeId, JSON.stringify(onboardingData), JSON.stringify(onboardingData)]
    );

    // Log the profile update
    console.log(`✅ Profile updated for employee ${employeeId} by user ${req.user.id}`);

    res.json({
      message: 'Profile updated successfully',
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Profile photo upload endpoint for current user
router.post('/profile/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const employeeId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const filePath = `/uploads/profile-photos/${req.file.filename}`;

    // Save photo to employee_profiles table
    await pool.query(
      'INSERT INTO employee_profiles (user_id, photo) VALUES (?, ?) ON DUPLICATE KEY UPDATE photo = ?',
      [employeeId, filePath, filePath]
    );

    // Also save to documents table for backup
    await pool.query(
      'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?)',
      [employeeId, 'passport_photo', req.file.originalname, filePath, 'APPROVED']
    );

    console.log(`✅ Profile photo uploaded for employee ${employeeId}`);

    res.json({
      message: 'Profile photo uploaded successfully',
      photoPath: filePath
    });

  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
});

// Profile photo upload endpoint
router.post('/:id/profile/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is uploading their own photo or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const filePath = `/uploads/profile-photos/${req.file.filename}`;

    // Save photo to employee_profiles table
    await pool.query(
      'INSERT INTO employee_profiles (user_id, photo) VALUES (?, ?) ON DUPLICATE KEY UPDATE photo = ?',
      [employeeId, filePath, filePath]
    );

    // Also save to documents table for backup
    await pool.query(
      'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?)',
      [employeeId, 'passport_photo', req.file.originalname, filePath, 'APPROVED']
    );

    console.log(`✅ Profile photo uploaded for employee ${employeeId}`);

    res.json({
      message: 'Profile photo uploaded successfully',
      photoPath: filePath
    });

  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
});

// Get profile statistics endpoint
router.get('/:id/profile/stats', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is accessing their own stats or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get account creation date
    const [userRows] = await pool.query(
      'SELECT createdAt FROM users WHERE id = ?',
      [employeeId]
    );

    // Get profile completion percentage
    const [profileRows] = await pool.query(
      'SELECT * FROM employee_profiles WHERE user_id = ?',
      [employeeId]
    );

    // Get document upload count
    const [docRows] = await pool.query(
      'SELECT COUNT(*) as docCount FROM documents WHERE user_id = ?',
      [employeeId]
    );

    // Get last profile update
    const [updateRows] = await pool.query(
      'SELECT submitted_at FROM onboarding_answers WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1',
      [employeeId]
    );

    const stats = {
      accountCreated: userRows[0]?.createdAt || null,
      profileCompleted: profileRows[0] ? calculateProfileCompletion(profileRows[0]) : 0,
      documentsUploaded: docRows[0]?.docCount || 0,
      lastUpdated: updateRows[0]?.submitted_at || userRows[0]?.createdAt || null,
      totalUpdates: updateRows.length || 0
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Failed to fetch profile statistics' });
  }
});

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(profileData) {
  const fields = ['dob', 'gender', 'nationality', 'qualification', 'specialization', 'college', 'graduationYear', 'cgpa', 'expectedSalary', 'location'];
  let completedFields = 0;

  fields.forEach(field => {
    if (profileData[field]) completedFields++;
  });

  return Math.round((completedFields / fields.length) * 100);
}





// Get employee profile by ID
router.get('/:id/profile', authenticateToken, employeeController.getEmployeeProfile);

// Offer letter routes
router.get('/:id/offer-letter', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is accessing their own offer letter or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [offerLetters] = await pool.query(
      'SELECT id, file_name, file_path, status, uploaded_at FROM documents WHERE user_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
      [employeeId, 'offer_letter']
    );

    if (offerLetters.length === 0) {
      return res.status(404).json({ error: 'Offer letter not found' });
    }

    res.json(offerLetters[0]);
  } catch (error) {
    console.error('Error fetching offer letter:', error);
    res.status(500).json({ error: 'Failed to fetch offer letter' });
  }
});

// Upload signed offer letter
router.post('/:id/signed-offer-letter', authenticateToken, upload.single('signedOfferLetter'), async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is uploading their own signed offer letter or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = `/uploads/signed-offer-letters/${req.file.filename}`;

    // Save signed offer letter document
    await pool.query(
      'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?)',
      [employeeId, 'signed_offer_letter', req.file.originalname, filePath, 'SUBMITTED']
    );

    // Update user onboarding status if needed
    await pool.query(
      'UPDATE users SET onboarding_step = 4, onboarding_status = ? WHERE id = ?',
      ['IN_PROGRESS', employeeId]
    );

    res.json({
      message: 'Signed offer letter uploaded successfully',
      filePath
    });
  } catch (error) {
    console.error('Error uploading signed offer letter:', error);
    res.status(500).json({ error: 'Failed to upload signed offer letter' });
  }
});

// ID card routes
router.get('/:id/id-card', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is accessing their own ID card or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [idCards] = await pool.query(
      'SELECT id, file_name, file_path, uploaded_at FROM documents WHERE user_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
      [employeeId, 'id_card']
    );

    if (idCards.length === 0) {
      return res.status(404).json({ error: 'ID card not found' });
    }

    res.json(idCards[0]);
  } catch (error) {
    console.error('Error fetching ID card:', error);
    res.status(500).json({ error: 'Failed to fetch ID card' });
  }
});

// Add this endpoint to return employee interview status
router.get('/interview-status', async (req, res) => {
  try {
    // You should get employee id from session/auth or query param
    // For demo, use ?employeeId=123 in the query
    const employeeId = req.query.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: 'Missing employeeId' });
    }

    // Fetch status from employees table (adjust as per your schema)
    const [rows] = await pool.query(
      'SELECT status, nextEligibleDate FROM employees WHERE id = ?',
      [employeeId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Map DB status to frontend status
    let status = 'pending';
    if (rows[0].status === 'selected' || rows[0].status === 'passed') status = 'passed';
    else if (rows[0].status === 'rejected' || rows[0].status === 'failed') status = 'failed';

    res.json({
      status,
      nextEligibleDate: rows[0].nextEligibleDate || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interview status' });
  }
});

// Get upcoming birthdays in current month
router.get('/upcoming-birthdays', authenticateToken, async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = currentDate.getDate();

    // Query employees whose birthday is in the current month and on or after today
    const [rows] = await pool.query(`
      SELECT
        u.id,
        COALESCE(ep.fullName, oa.data->>'$.fullName', u.fullName) as fullName,
        ep.dob,
        DAY(ep.dob) as birthDay,
        MONTH(ep.dob) as birthMonth
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN onboarding_answers oa ON u.id = oa.user_id AND oa.step = 1
      WHERE
        ep.dob IS NOT NULL
        AND MONTH(ep.dob) = ?
        AND (DAY(ep.dob) > ? OR (DAY(ep.dob) = ? AND MONTH(ep.dob) = ?))
        AND u.status = 'active'
      ORDER BY DAY(ep.dob) ASC
      LIMIT 10
    `, [currentMonth, currentDay - 1, currentDay, currentMonth]);

    // Format the response
    const birthdays = rows.map(row => ({
      id: row.id,
      fullName: row.fullName,
      birthDate: row.dob,
      birthDay: row.birthDay,
      birthMonth: row.birthMonth,
      isToday: row.birthDay === currentDay && row.birthMonth === currentMonth
    }));

    res.json({
      currentMonth,
      birthdays
    });
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming birthdays' });
  }
});

// Admin approval routes
router.put('/:id/approve', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, employeeController.approveEmployee);

router.put('/:id/decline', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, employeeController.declineEmployee);

module.exports = router;
