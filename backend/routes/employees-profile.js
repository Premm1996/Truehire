const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../db-fixed');

const multer = require('multer');
const path = require('path');

// Configure multer for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/passport-photos/'); // Changed from profiles/ to passport-photos/ for consistency
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure multer for offer letter upload
const offerLetterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/offer_letters/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `offerletter-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const offerLetterUpload = multer({
  storage: offerLetterStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed!'), false);
    }
  }
});

// Get current user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data from users table
    const [userRows] = await pool.query(
      'SELECT id, fullName, email, mobile, role, status, onboarding_step, onboarding_status, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userRows[0];

    // Get additional profile data from employee_profiles table (now includes new fields)
    const [profileRows] = await pool.query(
      'SELECT * FROM employee_profiles WHERE user_id = ?',
      [userId]
    );

    const profileData = profileRows[0] || {};

    // Get onboarding form data to include all registration details
    const [onboardingRows] = await pool.query(
      'SELECT data FROM onboarding_answers WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1',
      [userId]
    );

    let onboardingData = {};
    if (onboardingRows[0]) {
      try {
        if (typeof onboardingRows[0].data === 'string') {
          onboardingData = JSON.parse(onboardingRows[0].data);
        } else if (typeof onboardingRows[0].data === 'object') {
          onboardingData = onboardingRows[0].data;
        }
      } catch (e) {
        console.error('Error parsing onboarding data:', e);
      }
    }

    // Get photo from documents table or profile photo field
    let photoPath = profileData.photo || null;
    if (!photoPath) {
      const [photoDocs] = await pool.query(
        'SELECT file_path FROM documents WHERE user_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
        [userId, 'passport_photo']
      );
      if (photoDocs[0]) {
        photoPath = photoDocs[0].file_path;
      }
    }

    // Get manager name if managerId exists
    let managerName = null;
    if (profileData.managerId) {
      const [managerRows] = await pool.query(
        'SELECT fullName FROM users WHERE id = ?',
        [profileData.managerId]
      );
      if (managerRows[0]) {
        managerName = managerRows[0].fullName;
      }
    }

    // Helper function to get best available name
    const getBestName = () => {
      // Priority: onboarding_data > employee_profiles > users table > fallback
      if (onboardingData && onboardingData.fullName && onboardingData.fullName.trim()) {
        return onboardingData.fullName.trim();
      }
      if (profileData && profileData.fullName && profileData.fullName.trim()) {
        return profileData.fullName.trim();
      }
      if (userData.fullName && userData.fullName.trim()) {
        return userData.fullName.trim();
      }
      // Fallback to email username or user ID
      if (userData.email) {
        const emailUsername = userData.email.split('@')[0];
        return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1).replace(/[._-]/g, ' ');
      }
      return `User ${userData.id}`;
    };

    // Merge all data sources with priority: onboarding_data > employee_profiles > users
    // Include new fields from migration
    const userProfile = {
      id: userData.id,
      employeeId: profileData.employeeId || null,
      fullName: getBestName(),
      email: userData.email,
      personalEmail: profileData.personalEmail || onboardingData.personalEmail || null,
      mobile: userData.mobile || profileData.mobile,
      role: userData.role,
      status: profileData.status || userData.status || 'Active',
      jobTitle: profileData.position || onboardingData.jobTitle || null,
      department: profileData.department || null,
      onboarding_step: userData.onboarding_step,
      onboarding_status: userData.onboarding_status,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      // Header Section
      photo: photoPath,
      // Basic Information
      dob: profileData.dob || onboardingData.dob || null,
      gender: profileData.gender || onboardingData.gender || null,
      nationality: profileData.nationality || onboardingData.nationality || null,
      phone: profileData.phone || null,
      joiningDate: profileData.joiningDate || onboardingData.dateOfJoining || null,
      managerId: profileData.managerId || null,
      managerName: managerName,
      employmentType: profileData.employmentType || null,
      workMode: profileData.workMode || null,
      location: profileData.location || onboardingData.workLocation || null,
      // Professional Information
      qualification: profileData.qualification || onboardingData.qualification || null,
      specialization: profileData.specialization || onboardingData.specialization || null,
      college: profileData.college || onboardingData.college || null,
      graduationYear: profileData.graduationYear || onboardingData.graduationYear || null,
      cgpa: profileData.cgpa || onboardingData.cgpa || null,
      experience: profileData.experience || onboardingData.experience || null,
      skills: profileData.skills ? JSON.parse(profileData.skills) : null,
      currentProjects: profileData.currentProjects ? JSON.parse(profileData.currentProjects) : null,
      pastProjects: profileData.pastProjects ? JSON.parse(profileData.pastProjects) : null,
      certifications: profileData.certifications ? JSON.parse(profileData.certifications) : null,
      languages: profileData.languages ? JSON.parse(profileData.languages) : null,
      // Performance & Growth
      goals: profileData.goals ? JSON.parse(profileData.goals) : null,
      performanceRating: profileData.performanceRating || null,
      feedback: profileData.feedback || null,
      achievements: profileData.achievements || null,
      careerProgression: profileData.careerProgression ? JSON.parse(profileData.careerProgression) : null,
      // Personal Add-ons
      bio: profileData.bio || null,
      emergencyContact: profileData.emergencyContact ? JSON.parse(profileData.emergencyContact) : null,
      socialLinks: profileData.socialLinks ? JSON.parse(profileData.socialLinks) : { linkedin: profileData.linkedin || null },
      // Additional from onboarding
      expectedSalary: profileData.expectedSalary || onboardingData.expectedSalary || null
    };

    console.log('✅ User Profile Response:', {
      id: userProfile.id,
      fullName: userProfile.fullName,
      photo: userProfile.photo,
      hasPhoto: !!userProfile.photo,
      hasOnboardingData: Object.keys(onboardingData).length > 0,
      newFields: {
        employeeId: userProfile.employeeId,
        status: userProfile.status,
        skills: userProfile.skills,
        socialLinks: userProfile.socialLinks
      }
    });

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user's profile
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName, personalEmail, mobile, dob, gender, nationality, phone,
      joiningDate, employmentType, workMode, location, bio,
      skills, currentProjects, pastProjects, certifications, languages,
      goals, performanceRating, feedback, achievements, careerProgression,
      emergencyContact, socialLinks
    } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    // Prepare JSON fields
    const skillsJson = skills ? JSON.stringify(skills) : null;
    const currentProjectsJson = currentProjects ? JSON.stringify(currentProjects) : null;
    const pastProjectsJson = pastProjects ? JSON.stringify(pastProjects) : null;
    const certificationsJson = certifications ? JSON.stringify(certifications) : null;
    const languagesJson = languages ? JSON.stringify(languages) : null;
    const goalsJson = goals ? JSON.stringify(goals) : null;
    const careerProgressionJson = careerProgression ? JSON.stringify(careerProgression) : null;
    const emergencyContactJson = emergencyContact ? JSON.stringify(emergencyContact) : null;
    const socialLinksJson = socialLinks ? JSON.stringify(socialLinks) : null;

    // Check if profile exists
    const [existingProfile] = await pool.query(
      'SELECT id FROM employee_profiles WHERE user_id = ?',
      [userId]
    );

    if (existingProfile.length === 0) {
      // Create new profile
      await pool.query(
        `INSERT INTO employee_profiles (
          user_id, fullName, personalEmail, mobile, dob, gender, nationality, phone,
          joiningDate, employmentType, workMode, location, bio,
          skills, currentProjects, pastProjects, certifications, languages,
          goals, performanceRating, feedback, achievements, careerProgression,
          emergencyContact, socialLinks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, fullName, personalEmail, mobile, dob, gender, nationality, phone,
         joiningDate, employmentType, workMode, location, bio,
         skillsJson, currentProjectsJson, pastProjectsJson, certificationsJson, languagesJson,
         goalsJson, performanceRating, feedback, achievements, careerProgressionJson,
         emergencyContactJson, socialLinksJson]
      );
    } else {
      // Update existing profile
      await pool.query(
        `UPDATE employee_profiles SET
          fullName = ?, personalEmail = ?, mobile = ?, dob = ?, gender = ?, nationality = ?, phone = ?,
          joiningDate = ?, employmentType = ?, workMode = ?, location = ?, bio = ?,
          skills = ?, currentProjects = ?, pastProjects = ?, certifications = ?, languages = ?,
          goals = ?, performanceRating = ?, feedback = ?, achievements = ?, careerProgression = ?,
          emergencyContact = ?, socialLinks = ?
         WHERE user_id = ?`,
        [fullName, personalEmail, mobile, dob, gender, nationality, phone,
         joiningDate, employmentType, workMode, location, bio,
         skillsJson, currentProjectsJson, pastProjectsJson, certificationsJson, languagesJson,
         goalsJson, performanceRating, feedback, achievements, careerProgressionJson,
         emergencyContactJson, socialLinksJson, userId]
      );
    }

    // Return updated profile
    const updatedProfile = await pool.query(
      'SELECT * FROM employee_profiles WHERE user_id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile[0][0] || {}
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update specific employee's profile (for admin)
router.put('/:id/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if admin
    const [userRows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    if (userRows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const {
      fullName, personalEmail, mobile, dob, gender, nationality, phone,
      joiningDate, employmentType, workMode, location, bio,
      skills, currentProjects, pastProjects, certifications, languages,
      goals, performanceRating, feedback, achievements, careerProgression,
      emergencyContact, socialLinks, status, position, department, managerId
    } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    // Prepare JSON fields
    const skillsJson = skills ? JSON.stringify(skills) : null;
    const currentProjectsJson = currentProjects ? JSON.stringify(currentProjects) : null;
    const pastProjectsJson = pastProjects ? JSON.stringify(pastProjects) : null;
    const certificationsJson = certifications ? JSON.stringify(certifications) : null;
    const languagesJson = languages ? JSON.stringify(languages) : null;
    const goalsJson = goals ? JSON.stringify(goals) : null;
    const careerProgressionJson = careerProgression ? JSON.stringify(careerProgression) : null;
    const emergencyContactJson = emergencyContact ? JSON.stringify(emergencyContact) : null;
    const socialLinksJson = socialLinks ? JSON.stringify(socialLinks) : null;

    // Check if profile exists
    const [existingProfile] = await pool.query(
      'SELECT id FROM employee_profiles WHERE user_id = ?',
      [id]
    );

    if (existingProfile.length === 0) {
      // Create new profile
      await pool.query(
        `INSERT INTO employee_profiles (
          user_id, fullName, personalEmail, mobile, dob, gender, nationality, phone,
          joiningDate, employmentType, workMode, location, bio,
          skills, currentProjects, pastProjects, certifications, languages,
          goals, performanceRating, feedback, achievements, careerProgression,
          emergencyContact, socialLinks, status, position, department, managerId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, fullName, personalEmail, mobile, dob, gender, nationality, phone,
         joiningDate, employmentType, workMode, location, bio,
         skillsJson, currentProjectsJson, pastProjectsJson, certificationsJson, languagesJson,
         goalsJson, performanceRating, feedback, achievements, careerProgressionJson,
         emergencyContactJson, socialLinksJson, status, position, department, managerId]
      );
    } else {
      // Update existing profile
      await pool.query(
        `UPDATE employee_profiles SET
          fullName = ?, personalEmail = ?, mobile = ?, dob = ?, gender = ?, nationality = ?, phone = ?,
          joiningDate = ?, employmentType = ?, workMode = ?, location = ?, bio = ?,
          skills = ?, currentProjects = ?, pastProjects = ?, certifications = ?, languages = ?,
          goals = ?, performanceRating = ?, feedback = ?, achievements = ?, careerProgression = ?,
          emergencyContact = ?, socialLinks = ?, status = ?, position = ?, department = ?, managerId = ?
         WHERE user_id = ?`,
        [fullName, personalEmail, mobile, dob, gender, nationality, phone,
         joiningDate, employmentType, workMode, location, bio,
         skillsJson, currentProjectsJson, pastProjectsJson, certificationsJson, languagesJson,
         goalsJson, performanceRating, feedback, achievements, careerProgressionJson,
         emergencyContactJson, socialLinksJson, status, position, department, managerId, id]
      );
    }

    // Return updated profile
    const updatedProfile = await pool.query(
      'SELECT * FROM employee_profiles WHERE user_id = ?',
      [id]
    );

    res.json({
      message: 'Employee profile updated successfully',
      profile: updatedProfile[0][0] || {}
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile photo
router.put('/profile/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const userId = req.user.id;
    const photoPath = `/uploads/profiles/${req.file.filename}`;

    // Update employee_profiles with photo path
    await pool.query(
      'UPDATE employee_profiles SET photo = ? WHERE user_id = ?',
      [photoPath, userId]
    );

    // Also insert into documents for consistency
    await pool.query(
      'INSERT INTO documents (user_id, document_type, file_name, file_path, mime_type, file_size, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, 'passport_photo', req.file.originalname, photoPath, req.file.mimetype, req.file.size, 'APPROVED']
    );

    res.json({ message: 'Photo uploaded successfully', photo: photoPath });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific employee's profile (for admin)
router.get('/:id/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if admin or self
    const [userRows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    if (userRows[0].role !== 'admin' && parseInt(id) !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Similar to GET /profile but for specific ID
    const [targetUserRows] = await pool.query(
      'SELECT id, fullName, email, mobile, role, status, onboarding_step, onboarding_status, createdAt, updatedAt FROM users WHERE id = ?',
      [id]
    );

    if (targetUserRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUserData = targetUserRows[0];

    const [profileRows] = await pool.query(
      'SELECT * FROM employee_profiles WHERE user_id = ?',
      [id]
    );

    const profileData = profileRows[0] || {};

    // ... (similar merging logic as above, but for target ID)
    // For brevity, reuse the merging from GET /profile but with id instead of userId

    let photoPath = profileData.photo || null;
    if (!photoPath) {
      const [photoDocs] = await pool.query(
        'SELECT file_path FROM documents WHERE user_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
        [id, 'passport_photo']
      );
      if (photoDocs[0]) {
        photoPath = photoDocs[0].file_path;
      }
    }

    let managerName = null;
    if (profileData.managerId) {
      const [managerRows] = await pool.query(
        'SELECT fullName FROM users WHERE id = ?',
        [profileData.managerId]
      );
      if (managerRows[0]) {
        managerName = managerRows[0].fullName;
      }
    }

    const getBestName = () => {
      return targetUserData.fullName || `User ${targetUserData.id}`;
    };

    const adminProfile = {
      id: parseInt(id),
      employeeId: profileData.employeeId || null,
      fullName: getBestName(),
      email: targetUserData.email,
      personalEmail: profileData.personalEmail || null,
      mobile: targetUserData.mobile || profileData.mobile,
      role: targetUserData.role,
      status: profileData.status || targetUserData.status || 'Active',
      jobTitle: profileData.position || null,
      department: profileData.department || null,
      onboarding_step: targetUserData.onboarding_step,
      onboarding_status: targetUserData.onboarding_status,
      createdAt: targetUserData.createdAt,
      updatedAt: targetUserData.updatedAt,
      photo: photoPath,
      dob: profileData.dob || null,
      gender: profileData.gender || null,
      nationality: profileData.nationality || null,
      phone: profileData.phone || null,
      joiningDate: profileData.joiningDate || null,
      managerId: profileData.managerId || null,
      managerName: managerName,
      employmentType: profileData.employmentType || null,
      workMode: profileData.workMode || null,
      location: profileData.location || null,
      qualification: profileData.qualification || null,
      specialization: profileData.specialization || null,
      college: profileData.college || null,
      graduationYear: profileData.graduationYear || null,
      cgpa: profileData.cgpa || null,
      experience: profileData.experience || null,
      skills: profileData.skills ? JSON.parse(profileData.skills) : null,
      currentProjects: profileData.currentProjects ? JSON.parse(profileData.currentProjects) : null,
      pastProjects: profileData.pastProjects ? JSON.parse(profileData.pastProjects) : null,
      certifications: profileData.certifications ? JSON.parse(profileData.certifications) : null,
      languages: profileData.languages ? JSON.parse(profileData.languages) : null,
      goals: profileData.goals ? JSON.parse(profileData.goals) : null,
      performanceRating: profileData.performanceRating || null,
      feedback: profileData.feedback || null,
      achievements: profileData.achievements || null,
      careerProgression: profileData.careerProgression ? JSON.parse(profileData.careerProgression) : null,
      bio: profileData.bio || null,
      emergencyContact: profileData.emergencyContact ? JSON.parse(profileData.emergencyContact) : null,
      socialLinks: profileData.socialLinks ? JSON.parse(profileData.socialLinks) : { linkedin: profileData.linkedin || null },
      expectedSalary: profileData.expectedSalary || null
    };

    res.json(adminProfile);
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
