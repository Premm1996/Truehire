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

// Get current employee profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Get user data from users table
    const [userRows] = await pool.query(
      'SELECT id, fullName, email, mobile, position, experience, onboarding_step, onboarding_status FROM users WHERE id = ? AND role = ?',
      [req.user.id, 'employee']
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const userData = userRows[0];

    // Get additional profile data from employee_profiles table
    const [profileRows] = await pool.query(
      'SELECT photo, dob, gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location FROM employee_profiles WHERE user_id = ?',
      [req.user.id]
    );

    const profileData = profileRows[0] || {};

    // Merge the data
    const employeeProfile = {
      ...userData,
      photo: profileData.photo || null,
      dob: profileData.dob || null,
      gender: profileData.gender || null,
      nationality: profileData.nationality || null,
      qualification: profileData.qualification || null,
      specialization: profileData.specialization || null,
      college: profileData.college || null,
      graduationYear: profileData.graduationYear || null,
      cgpa: profileData.cgpa || null,
      expectedSalary: profileData.expectedSalary || null,
      location: profileData.location || null
    };

    res.json(employeeProfile);
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee profile by ID
router.get('/:id/profile', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is accessing their own profile or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user data from users table
    const [userRows] = await pool.query(
      'SELECT id, fullName, email, mobile, position, experience, onboarding_step, onboarding_status FROM users WHERE id = ? AND role = ?',
      [employeeId, 'employee']
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const userData = userRows[0];

    // Get additional profile data from employee_profiles table
    const [profileRows] = await pool.query(
      'SELECT photo, dob, gender, nationality, qualification, specialization, college, graduationYear, cgpa, expectedSalary, location FROM employee_profiles WHERE user_id = ?',
      [employeeId]
    );

    const profileData = profileRows[0] || {};

    // Debug logging for photo data
    console.log('🔍 Employee Profile Debug:', {
      employeeId,
      userData,
      profileData,
      photoPath: profileData.photo
    });

    // Merge the data
    const employeeProfile = {
      ...userData,
      photo: profileData.photo || null,
      dob: profileData.dob || null,
      gender: profileData.gender || null,
      nationality: profileData.nationality || null,
      qualification: profileData.qualification || null,
      specialization: profileData.specialization || null,
      college: profileData.college || null,
      graduationYear: profileData.graduationYear || null,
      cgpa: profileData.cgpa || null,
      expectedSalary: profileData.expectedSalary || null,
      location: profileData.location || null
    };

    console.log('✅ Employee Profile Response:', {
      id: employeeProfile.id,
      fullName: employeeProfile.fullName,
      photo: employeeProfile.photo,
      hasPhoto: !!employeeProfile.photo
    });

    res.json(employeeProfile);
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

module.exports = router;
