const { pool } = require('../db');
const emailService = require('../utils/emailService');
const ValidationService = require('../utils/validation');
const { auditLog } = require('../middleware/auth');

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id,
        COALESCE(ep.fullName, oa.data->>'$.fullName', u.fullName) as fullName,
        u.email,
        u.mobile,
        u.role,
        u.status,
        u.position,
        u.department,
        u.createdAt,
        ep.photo,
        ep.dob,
        ep.location
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN onboarding_answers oa ON u.id = oa.user_id AND oa.step = 1
      WHERE u.role = 'employee'
      ORDER BY u.createdAt DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// Get employee statistics
const getEmployeeStats = async (req, res) => {
  try {
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = ?', ['employee']);
    const [activeRows] = await pool.query('SELECT COUNT(*) as active FROM users WHERE role = ? AND status = ?', ['employee', 'active']);
    const [inactiveRows] = await pool.query('SELECT COUNT(*) as inactive FROM users WHERE role = ? AND status = ?', ['employee', 'inactive']);

    const stats = {
      total: totalRows[0].total,
      active: activeRows[0].active,
      inactive: inactiveRows[0].inactive
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ error: 'Failed to fetch employee statistics' });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const [rows] = await pool.query(`
      SELECT
        u.id,
        COALESCE(ep.fullName, oa.data->>'$.fullName', u.fullName) as fullName,
        u.email,
        u.mobile,
        u.role,
        u.status,
        u.position,
        u.department,
        u.createdAt,
        ep.photo,
        ep.dob,
        ep.gender,
        ep.location
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN onboarding_answers oa ON u.id = oa.user_id AND oa.step = 1
      WHERE u.id = ? AND u.role = 'employee'
    `, [employeeId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { fullName, email, mobile, position, department } = req.body;

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    const [result] = await pool.query(
      'INSERT INTO users (fullName, email, mobile, password, role, status, position, department, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [fullName, email, mobile, tempPassword, 'employee', 'active', position, department]
    );

    // Log the creation
    await auditLog(req.user.id, 'CREATE_EMPLOYEE', `Created employee ${fullName} with ID ${result.insertId}`);

    res.status(201).json({
      message: 'Employee created successfully',
      employeeId: result.insertId,
      tempPassword
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

// Update employee status
const updateEmployeeStatus = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { status } = req.body;

    await pool.query(
      'UPDATE users SET status = ?, updatedAt = NOW() WHERE id = ? AND role = ?',
      [status, employeeId, 'employee']
    );

    // Log the update
    await auditLog(req.user.id, 'UPDATE_EMPLOYEE_STATUS', `Updated employee ${employeeId} status to ${status}`);

    res.json({ message: 'Employee status updated successfully' });
  } catch (error) {
    console.error('Error updating employee status:', error);
    res.status(500).json({ error: 'Failed to update employee status' });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    await pool.query('DELETE FROM users WHERE id = ? AND role = ?', [employeeId, 'employee']);

    // Log the deletion
    await auditLog(req.user.id, 'DELETE_EMPLOYEE', `Deleted employee ${employeeId}`);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

// Upload employee documents
const uploadDocuments = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const documentTypes = {
      marks10: '10th_marksheet',
      marks12: '12th_marksheet',
      diploma: 'diploma_certificate',
      semMarks: 'semester_marks',
      degreeCert: 'degree_certificate',
      aadhaar: 'aadhaar_card',
      pan: 'pan_card',
      secondaryId: 'secondary_id',
      photo: 'passport_photo',
      resume: 'resume',
      offerLetter: 'offer_letter',
      relievingLetter: 'relieving_letter',
      salarySlips: 'salary_slips',
      experienceCert: 'experience_certificate',
      bankProof: 'bank_proof'
    };

    const uploadedDocs = [];

    for (const [fieldName, fileArray] of Object.entries(files)) {
      const docType = documentTypes[fieldName];
      if (!docType) continue;

      for (const file of fileArray) {
        const filePath = `/uploads/documents/${file.filename}`;

        await pool.query(
          'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?)',
          [employeeId, docType, file.originalname, filePath, 'SUBMITTED']
        );

        uploadedDocs.push({
          type: docType,
          fileName: file.originalname,
          filePath
        });
      }
    }

    res.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocs
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

// Get employee documents
const getEmployeeDocuments = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if user is accessing their own documents or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.query(
      'SELECT id, document_type, file_name, file_path, status, uploaded_at FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC',
      [employeeId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching employee documents:', error);
    res.status(500).json({ error: 'Failed to fetch employee documents' });
  }
};

// Update employee profile
const updateEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updates = req.body;

    // Check if user is updating their own profile or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update users table
    const userFields = ['fullName', 'mobile', 'position', 'department'];
    const userUpdates = {};
    userFields.forEach(field => {
      if (updates[field] !== undefined) {
        userUpdates[field] = updates[field];
      }
    });

    if (Object.keys(userUpdates).length > 0) {
      const setClause = Object.keys(userUpdates).map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(userUpdates), employeeId];
      await pool.query(`UPDATE users SET ${setClause}, updatedAt = NOW() WHERE id = ?`, values);
    }

    // Update employee_profiles table
    const profileFields = ['photo', 'dob', 'gender', 'nationality', 'qualification', 'specialization', 'college', 'graduationYear', 'cgpa', 'expectedSalary', 'location'];
    const profileUpdates = {};
    profileFields.forEach(field => {
      if (updates[field] !== undefined) {
        profileUpdates[field] = updates[field];
      }
    });

    if (Object.keys(profileUpdates).length > 0) {
      const setClause = Object.keys(profileUpdates).map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(profileUpdates), employeeId];
      await pool.query(
        `INSERT INTO employee_profiles (user_id, ${Object.keys(profileUpdates).join(', ')}) VALUES (?, ${Object.keys(profileUpdates).map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE ${setClause}`,
        [employeeId, ...Object.values(profileUpdates), ...Object.values(profileUpdates)]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get employee dashboard data
const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.params.id;
    console.log(`Fetching dashboard for employee ID: ${employeeId}, requested by user ID: ${req.user.id}`);

    // Check if user is accessing their own dashboard or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      console.warn(`Access denied for user ${req.user.id} to employee dashboard ${employeeId}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get basic employee info
    const [userRows] = await pool.query(
      'SELECT fullName, email, role, status, position, department, createdAt FROM users WHERE id = ?',
      [employeeId]
    );

    if (userRows.length === 0) {
      console.warn(`Employee not found: ${employeeId}`);
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = userRows[0];

    // Get attendance stats for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [attendanceRows] = await pool.query(`
      SELECT
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absentDays,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as lateDays
      FROM attendance
      WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
    `, [employeeId, currentMonth, currentYear]);

    const attendance = attendanceRows[0] || { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0 };

    // Get pending documents count
    const [docRows] = await pool.query(
      'SELECT COUNT(*) as pendingDocs FROM documents WHERE user_id = ? AND status = ?',
      [employeeId, 'SUBMITTED']
    );

    const dashboard = {
      employee: {
        id: employeeId,
        fullName: employee.fullName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        status: employee.status,
        joinDate: employee.createdAt
      },
      attendance: {
        month: currentMonth,
        year: currentYear,
        totalDays: attendance.totalDays,
        presentDays: attendance.presentDays,
        absentDays: attendance.absentDays,
        lateDays: attendance.lateDays,
        attendancePercentage: attendance.totalDays > 0 ? Math.round((attendance.presentDays / attendance.totalDays) * 100) : 0
      },
      pendingDocuments: docRows[0].pendingDocs || 0
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching employee dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Implement getEmployeeProfile function
const getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;
    console.log(`Fetching profile for employee ID: ${employeeId}, requested by user ID: ${req.user.id}`);

    // Check if user is accessing their own profile or is admin
    if (req.user.id != employeeId && req.user.role !== 'admin') {
      console.warn(`Access denied for user ${req.user.id} to employee profile ${employeeId}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user data from users table
    const [userRows] = await pool.query(
      'SELECT id, fullName, email, mobile, role, status, onboarding_step, onboarding_status, createdAt, updatedAt, profile FROM users WHERE id = ?',
      [employeeId]
    );

    if (userRows.length === 0) {
      console.warn(`Employee not found: ${employeeId}`);
      return res.status(404).json({ message: 'Employee not found' });
    }

    const userData = userRows[0];

    // Parse profile data from users table
    let userProfileData = {};
    if (userData.profile) {
      try {
        if (typeof userData.profile === 'string') {
          userProfileData = JSON.parse(userData.profile);
        } else if (typeof userData.profile === 'object') {
          userProfileData = userData.profile;
        }
      } catch (e) {
        console.error('Error parsing user profile data:', e);
      }
    }

    // Get additional profile data from employee_profiles table
    const [profileRows] = await pool.query(
      'SELECT * FROM employee_profiles WHERE user_id = ?',
      [employeeId]
    );

    const profileData = profileRows[0] || {};

    // Get onboarding form data to include all registration details
    const [onboardingRows] = await pool.query(
      'SELECT data FROM onboarding_answers WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1',
      [employeeId]
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

    // Get photo from documents table
    let photoPath = null;
    const [photoDocs] = await pool.query(
      'SELECT file_path FROM documents WHERE user_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
      [employeeId, 'passport_photo']
    );
    if (photoDocs[0]) {
      photoPath = photoDocs[0].file_path;
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
      // Fallback to email username or employee ID
      if (userData.email) {
        const emailUsername = userData.email.split('@')[0];
        return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1).replace(/[._-]/g, ' ');
      }
      return `Employee ${userData.id}`;
    };

    // Merge all data sources with priority: onboarding_data > employee_profiles > users.profile > users table
    const employeeProfile = {
      id: userData.id,
      fullName: getBestName(),
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      status: userData.status,
      onboarding_step: userData.onboarding_step,
      onboarding_status: userData.onboarding_status,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      // Override with employee_profiles data
      photo: photoPath || profileData.photo,
      dob: profileData.dob || onboardingData.dob || userProfileData.dob || null,
      gender: profileData.gender || onboardingData.gender || userProfileData.gender || null,
      nationality: profileData.nationality || onboardingData.nationality || userProfileData.nationality || null,
      qualification: profileData.qualification || onboardingData.qualification || userProfileData.qualification || null,
      specialization: profileData.specialization || onboardingData.specialization || userProfileData.specialization || null,
      college: profileData.college || onboardingData.college || userProfileData.college || null,
      graduationYear: profileData.graduationYear || onboardingData.graduationYear || userProfileData.graduationYear || null,
      cgpa: profileData.cgpa || onboardingData.cgpa || userProfileData.cgpa || null,
      expectedSalary: profileData.expectedSalary || onboardingData.expectedSalary || userProfileData.expectedSalary || null,
      location: profileData.location || onboardingData.workLocation || userProfileData.location || null,
      // Additional fields from onboarding form
      personalEmail: userData.email || onboardingData.personalEmail || userProfileData.personalEmail || null,
      jobTitle: onboardingData.jobTitle || userProfileData.jobTitle || null,
      mobileNumber: userData.mobile || onboardingData.mobileNumber || userProfileData.mobileNumber || null,
      accountNumber: onboardingData.accountNumber || userProfileData.accountNumber || null,
      ifscCode: onboardingData.ifscCode || userProfileData.ifscCode || null,
      bankName: onboardingData.bankName || userProfileData.bankName || null,
      dateOfJoining: onboardingData.dateOfJoining || userProfileData.dateOfJoining || null,
      workLocation: onboardingData.workLocation || userProfileData.workLocation || null,
      experience: onboardingData.experience || userProfileData.experience || null,
      // Additional fields for dashboard compatibility
      department: userData.department || onboardingData.department || userProfileData.department || null,
      employeeId: userData.id, // Use id as employeeId
      managerName: null, // Not in schema, set to null
      joiningDate: userData.createdAt, // Use createdAt as joiningDate
      // More registration details
      currentAddress: onboardingData.currentAddress || userProfileData.currentAddress || null,
      permanentAddress: onboardingData.permanentAddress || userProfileData.permanentAddress || null,
      panNumber: onboardingData.panNumber || userProfileData.panNumber || null,
      aadhaarNumber: onboardingData.aadhaarNumber || userProfileData.aadhaarNumber || null,
      passport: onboardingData.passport || userProfileData.passport || null,
      drivingLicence: onboardingData.drivingLicence || userProfileData.drivingLicence || null,
      accountHolderName: onboardingData.accountHolderName || userProfileData.accountHolderName || null,
      branchLocation: onboardingData.branchLocation || userProfileData.branchLocation || null,
      linkedInProfile: onboardingData.linkedInProfile || userProfileData.linkedInProfile || null,
      portfolioGitHub: onboardingData.portfolioGitHub || userProfileData.portfolioGitHub || null,
      bloodGroup: onboardingData.bloodGroup || userProfileData.bloodGroup || null,
      // Arrays from registration
      education: onboardingData.education || userProfileData.education || [],
      previousEmployment: onboardingData.previousEmployment || userProfileData.previousEmployment || []
    };

    console.log('✅ Employee Profile Response:', {
      id: employeeProfile.id,
      fullName: employeeProfile.fullName,
      photo: employeeProfile.photo,
      hasPhoto: !!employeeProfile.photo,
      hasOnboardingData: Object.keys(onboardingData).length > 0
    });

    res.json(employeeProfile);
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve employee
const approveEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { reason } = req.body; // optional reason

    // Check if employee exists and is pending
    const [existing] = await pool.query(
      'SELECT fullName, email FROM users WHERE id = ? AND role = "employee" AND approved = 0',
      [employeeId]
    );
    if (existing.length === 0) {
      return res.status(400).json({ error: 'Employee not found or already approved' });
    }

    const employee = existing[0];

    // Update approved status and set to active
    await pool.query(
      'UPDATE users SET approved = 1, status = "active", updatedAt = NOW() WHERE id = ?',
      [employeeId]
    );

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(employee.email, employee.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the approval if email fails
    }

    // Log audit
    await auditLog(req.user.id, 'APPROVE_EMPLOYEE', `Approved employee ${employeeId} (${employee.fullName})${reason ? ` - Reason: ${reason}` : ''}`);

    res.json({ message: 'Employee approved successfully' });
  } catch (error) {
    console.error('Error approving employee:', error);
    res.status(500).json({ error: 'Failed to approve employee' });
  }
};

// Decline employee
const declineEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { reason } = req.body; // required reason for decline

    if (!reason) {
      return res.status(400).json({ error: 'Reason for decline is required' });
    }

    // Check if employee exists and is pending
    const [existing] = await pool.query(
      'SELECT fullName, email FROM users WHERE id = ? AND role = "employee" AND approved = 0',
      [employeeId]
    );
    if (existing.length === 0) {
      return res.status(400).json({ error: 'Employee not found or already approved' });
    }

    const employee = existing[0];

    // Update approved status and set to inactive
    await pool.query(
      'UPDATE users SET approved = 0, status = "inactive", updatedAt = NOW() WHERE id = ?',
      [employeeId]
    );

    // Send rejection email
    try {
      await emailService.sendRejectionEmail(employee.email, employee.fullName, reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the decline if email fails
    }

    // Log audit
    await auditLog(req.user.id, 'DECLINE_EMPLOYEE', `Declined employee ${employeeId} (${employee.fullName}) - Reason: ${reason}`);

    res.json({ message: 'Employee declined successfully' });
  } catch (error) {
    console.error('Error declining employee:', error);
    res.status(500).json({ error: 'Failed to decline employee' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeStats,
  getEmployeeById,
  createEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  uploadDocuments,
  getEmployeeDocuments,
  updateEmployeeProfile,
  getEmployeeDashboard,
  getEmployeeProfile,
  approveEmployee,
  declineEmployee
};
