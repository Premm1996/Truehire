const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken, requireAdmin, requireReAuth, auditLog } = require('../middleware/auth');
const db = require('../db');
const { pool } = require('../db');
const AdminController = require('../controllers/adminController');
const payrollController = require('../controllers/payrollController');
const reimbursementsController = require('../controllers/reimbursementsController');
const payslipController = require('../controllers/payslipController');
const attendanceController = require('../controllers/attendanceController');
const TaxDeclarations = require('../models/TaxDeclarations');
const SalaryStructure = require('../models/SalaryStructure');

// Configure multer for file uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, 'uploads/');
},
filename: (req, file, cb) => {
cb(null, Date.now() + '_' + file.originalname);
}
});

const upload = multer({
storage,
limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
fileFilter: (req, file, cb) => {
if (file.mimetype === 'application/pdf') {
cb(null, true);
} else {
cb(new Error('Only PDF files are allowed'), false);
}
}
});

// Basic admin routes
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
try {
// Get comprehensive dashboard data
const dashboardData = await getDashboardData();
res.json(dashboardData);
} catch (error) {
console.error('Error fetching dashboard data:', error);
res.status(500).json({ message: 'Failed to fetch dashboard data' });
}
});

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
try {
const statsData = await getStatsData();
res.json(statsData);
} catch (error) {
console.error('Error fetching stats data:', error);
res.status(500).json({ message: 'Failed to fetch stats data' });
}
});

// Helper function to get comprehensive dashboard data
async function getDashboardData() {
try {
// Get employee statistics
const [employeeStats] = await pool.query(`
SELECT
COUNT(*) as totalEmployees,
SUM(CASE WHEN onboarding_status = 'COMPLETE' THEN 1 ELSE 0 END) as completed,
SUM(CASE WHEN onboarding_status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
SUM(CASE WHEN onboarding_status = 'NOT_STARTED' THEN 1 ELSE 0 END) as notStarted
FROM users
WHERE role IN ('employee', 'candidate')
`);

// Get offer letters count
const [offerLetterDocs] = await pool.query(
'SELECT COUNT(*) as count FROM documents WHERE document_type IN (?, ?)',
['offer_letter', 'signed_offer_letter']
);

// Get onboarding completion percentage
const [onboardingData] = await pool.query(
'SELECT COUNT(*) as total, SUM(CASE WHEN onboarding_status = ? THEN 1 ELSE 0 END) as completed FROM users WHERE role IN (?, ?)',
['COMPLETE', 'employee', 'candidate']
);

const totalEmployees = employeeStats[0]?.totalEmployees || 0;
const completedEmployees = onboardingData[0]?.completed || 0;
const completionPercentage = totalEmployees > 0 ? Math.round((completedEmployees / totalEmployees) * 100) : 0;

// Get attendance data (if available)
try {
const [attendanceData] = await pool.query(
'SELECT COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as present FROM attendance WHERE DATE(date) = CURDATE()',
['present']
);

const totalAttendance = attendanceData[0]?.total || 0;
const presentCount = attendanceData[0]?.present || 0;
const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

return {
totalEmployees: totalEmployees,
completed: employeeStats[0]?.completed || 0,
inProgress: employeeStats[0]?.inProgress || 0,
notStarted: employeeStats[0]?.notStarted || 0,
offerLettersIssued: offerLetterDocs[0]?.count || 0,
onboardingCompletion: completionPercentage,
attendanceRate: attendanceRate,
totalCandidates: totalEmployees,
totalEmployers: 0, // Not implemented yet
totalJobs: 0, // Not implemented yet
pendingReviews: 0 // Not implemented yet
};
} catch (attendanceErr) {
// If attendance table doesn't exist, skip attendance data
return {
totalEmployees: totalEmployees,
completed: employeeStats[0]?.completed || 0,
inProgress: employeeStats[0]?.inProgress || 0,
notStarted: employeeStats[0]?.notStarted || 0,
offerLettersIssued: offerLetterDocs[0]?.count || 0,
onboardingCompletion: completionPercentage,
attendanceRate: 0, // Will be updated when attendance system is added
totalCandidates: totalEmployees,
totalEmployers: 0, // Not implemented yet
totalJobs: 0, // Not implemented yet
pendingReviews: 0 // Not implemented yet
};
}
} catch (error) {
throw error;
}
}

// Helper function to get stats data
async function getStatsData() {
try {
// Get employee statistics
const [employeeStats] = await pool.query(`
SELECT
COUNT(*) as totalEmployees,
SUM(CASE WHEN onboarding_status = 'COMPLETE' THEN 1 ELSE 0 END) as completed,
SUM(CASE WHEN onboarding_status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
SUM(CASE WHEN onboarding_status = 'NOT_STARTED' THEN 1 ELSE 0 END) as notStarted
FROM users
WHERE role IN ('employee', 'candidate')
`);

// Get offer letters count
const [offerLetterDocs] = await pool.query(
'SELECT COUNT(*) as count FROM documents WHERE document_type IN (?, ?)',
['offer_letter', 'signed_offer_letter']
);

// Get onboarding completion percentage
const [onboardingData] = await pool.query(
'SELECT COUNT(*) as total, SUM(CASE WHEN onboarding_status = ? THEN 1 ELSE 0 END) as completed FROM users WHERE role IN (?, ?)',
['COMPLETE', 'employee', 'candidate']
);

const totalEmployees = employeeStats[0]?.totalEmployees || 0;
const completedEmployees = onboardingData[0]?.completed || 0;
const completionPercentage = totalEmployees > 0 ? Math.round((completedEmployees / totalEmployees) * 100) : 0;

return {
totalEmployees: totalEmployees,
completed: employeeStats[0]?.completed || 0,
inProgress: employeeStats[0]?.inProgress || 0,
notStarted: employeeStats[0]?.notStarted || 0,
offerLettersIssued: offerLetterDocs[0]?.count || 0,
onboardingCompletion: completionPercentage,
attendanceRate: 0, // Will be updated when attendance system is added
totalCandidates: totalEmployees,
totalEmployers: 0, // Not implemented yet
totalJobs: 0, // Not implemented yet
pendingReviews: 0 // Not implemented yet
};
} catch (error) {
throw error;
}
}

// Get employee stats separately
router.get('/employees/stats', authenticateToken, requireAdmin, async (req, res) => {
try {
// Fetch employees with onboarding info
const [employees] = await pool.query(`
SELECT onboarding_status
FROM users
WHERE role IN ('employee', 'candidate')
`);

// Calculate stats
const stats = {
totalEmployees: employees.length,
completed: employees.filter(e => e.onboarding_status === 'COMPLETE').length,
inProgress: employees.filter(e => e.onboarding_status === 'IN_PROGRESS').length,
notStarted: employees.filter(e => e.onboarding_status === 'NOT_STARTED').length
};

res.json(stats);
} catch (error) {
console.error('Error fetching employee stats:', error);
res.status(500).json({ message: 'Failed to fetch employee stats' });
}
});

// Get employees with onboarding status and stats (enhanced endpoint)
router.get('/employees/enhanced', authenticateToken, requireAdmin, async (req, res) => {
try {
// Fetch employees with onboarding info and approval status
const [employees] = await pool.query(`
SELECT
id, fullName, email, phone, position, department, onboarding_status, onboarding_step, createdAt, updatedAt, approved
FROM users
WHERE role IN ('employee', 'candidate')
ORDER BY createdAt DESC
`);

console.log('Fetched employees from DB:', employees.length);

// Transform employees to match frontend expectations
const transformedEmployees = employees.map(employee => {
// Split fullName into firstName and lastName
const nameParts = employee.fullName ? employee.fullName.split(' ') : ['', ''];
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';

return {
id: employee.id,
fullName: employee.fullName || `${firstName} ${lastName}`.trim(), // Use fullName field as expected by frontend
firstName: firstName,
lastName: lastName,
email: employee.email,
phone: employee.phone,
position: employee.position,
status: employee.onboarding_status || 'pending', // Map onboarding_status to status
onboardingStatus: employee.onboarding_status || 'pending', // For dashboard compatibility
onboardingStep: employee.onboarding_step || 0, // For dashboard compatibility
createdAt: employee.createdAt,
department: employee.department,
onboarding_step: employee.onboarding_step,
updatedAt: employee.updatedAt,
approved: employee.approved === 1
};
});

// For each employee, check if offer letter and ID card documents exist
for (let i = 0; i < transformedEmployees.length; i++) {
const employee = transformedEmployees[i];

const [offerLetterDocs] = await pool.query(
'SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND document_type IN (?, ?)',
[employee.id, 'offer_letter', 'signed_offer_letter']
);
employee.offerLetterUploaded = offerLetterDocs[0].count > 0;

const [idCardDocs] = await pool.query(
'SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND document_type = ?',
[employee.id, 'id_card']
);
employee.idCardGenerated = idCardDocs[0].count > 0;
}

// Calculate stats
const stats = {
totalEmployees: transformedEmployees.length,
completed: transformedEmployees.filter(e => e.status === 'COMPLETE').length,
inProgress: transformedEmployees.filter(e => e.status === 'IN_PROGRESS').length,
notStarted: transformedEmployees.filter(e => e.status === 'NOT_STARTED').length
};

res.json({ employees: transformedEmployees, stats });
} catch (error) {
console.error('Error fetching employees:', error);
res.status(500).json({ message: 'Failed to fetch employees' });
}
});

// Get employees with onboarding status and stats
router.get('/employees', authenticateToken, requireAdmin, async (req, res) => {
try {
// Fetch employees with onboarding info and approval status
const [employees] = await pool.query(`
SELECT
id, fullName, email, phone, position, department, onboarding_status, onboarding_step, createdAt, updatedAt, approved
FROM users
WHERE role IN ('employee', 'candidate')
ORDER BY createdAt DESC
`);

console.log('Fetched employees from DB:', employees.length);

// Transform employees to match frontend expectations
const transformedEmployees = employees.map(employee => {
// Split fullName into firstName and lastName
const nameParts = employee.fullName ? employee.fullName.split(' ') : ['', ''];
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';

return {
id: employee.id,
fullName: employee.fullName || `${firstName} ${lastName}`.trim(), // Use fullName field as expected by frontend
firstName: firstName,
lastName: lastName,
email: employee.email,
phone: employee.phone,
position: employee.position,
status: employee.onboarding_status || 'pending', // Map onboarding_status to status
onboardingStatus: employee.onboarding_status || 'pending', // For dashboard compatibility
onboardingStep: employee.onboarding_step || 0, // For dashboard compatibility
createdAt: employee.createdAt,
department: employee.department,
onboarding_step: employee.onboarding_step,
updatedAt: employee.updatedAt,
approved: employee.approved === 1
};
});

// For each employee, check if offer letter and ID card documents exist
for (let i = 0; i < transformedEmployees.length; i++) {
const employee = transformedEmployees[i];

const [offerLetterDocs] = await pool.query(
'SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND document_type IN (?, ?)',
[employee.id, 'offer_letter', 'signed_offer_letter']
);
employee.offerLetterUploaded = offerLetterDocs[0].count > 0;

const [idCardDocs] = await pool.query(
'SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND document_type = ?',
[employee.id, 'id_card']
);
employee.idCardGenerated = idCardDocs[0].count > 0;
}

// Calculate stats
const stats = {
totalEmployees: transformedEmployees.length,
completed: transformedEmployees.filter(e => e.status === 'COMPLETE').length,
inProgress: transformedEmployees.filter(e => e.status === 'IN_PROGRESS').length,
notStarted: transformedEmployees.filter(e => e.status === 'NOT_STARTED').length
};

res.json({ employees: transformedEmployees, stats });
} catch (error) {
console.error('Error fetching employees:', error);
res.status(500).json({ message: 'Failed to fetch employees' });
}
});

// Approve employee
router.post('/employees/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
try {
const { id } = req.params;
const adminId = req.user.id;

// Check if employee exists and is not already approved
const [employeeRows] = await pool.query(
'SELECT id, fullName, email FROM users WHERE id = ? AND role IN (?, ?) AND (approved IS NULL OR approved = 0)',
[id, 'employee', 'candidate']
);

if (employeeRows.length === 0) {
return res.status(404).json({ message: 'Employee not found or already approved' });
}

const employee = employeeRows[0];

// Update approved status to true and set status to active
await pool.query(
'UPDATE users SET approved = 1, status = "active", updatedAt = NOW() WHERE id = ?',
[id]
);

// Create notification for the approved employee
try {
await pool.query(
`INSERT INTO notifications (title, message, type, target_type, target_id, priority, created_by, created_at)
 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
['Welcome to the Company!',
 'Congratulations! Your account has been approved. You can now access all employee features.',
 'success',
 'employee',
 id,
 'high',
 req.user.id]
);
} catch (notificationErr) {
console.error('Error creating approval notification:', notificationErr);
// Don't fail the approval if notification creation fails
}

// Audit the approval
await auditLog(id, adminId, 'APPROVE_EMPLOYEE', {
approvedBy: req.user.email,
employeeId: id,
employeeName: employee.fullName,
employeeEmail: employee.email
}, req.ip, req.get('User-Agent'));

res.json({ message: 'Employee approved successfully' });
} catch (error) {
console.error('Error approving employee:', error);
res.status(500).json({ message: 'Failed to approve employee' });
}
});

// Decline employee (delete or mark declined)
router.post('/employees/:id/decline', authenticateToken, requireAdmin, async (req, res) => {
try {
const { id } = req.params;
const adminId = req.user.id;

// For simplicity, delete the user on decline
db.run(
'DELETE FROM users WHERE id = ? AND role IN (?, ?)',
[id, 'employee', 'candidate'],
function(err) {
if (err) {
console.error('Error declining employee:', err);
return res.status(500).json({ message: 'Failed to decline employee' });
}

if (this.changes === 0) {
return res.status(404).json({ message: 'Employee not found' });
}

// Audit the decline
auditLog(id, adminId, 'DECLINE_EMPLOYEE', {
declinedBy: req.user.email,
employeeId: id
}, req.ip, req.get('User-Agent'));

res.json({ message: 'Employee declined and deleted successfully' });
}
);
} catch (error) {
console.error('Error declining employee:', error);
res.status(500).json({ message: 'Failed to decline employee' });
}
});

// Delete employee
router.delete('/employees/:id', authenticateToken, requireAdmin, async (req, res) => {
try {
const { id } = req.params;
const adminId = req.user.id;

// Audit the deletion BEFORE deleting the user
await auditLog(id, adminId, 'DELETE_EMPLOYEE', {
deletedBy: req.user.email,
employeeId: id
}, req.ip, req.get('User-Agent'));

// Delete in proper order to handle foreign key constraints
// First delete related records, then the user

// Delete from employee_profiles (if exists)
db.run('DELETE FROM employee_profiles WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting employee profile:', err);
return res.status(500).json({ message: 'Failed to delete employee profile' });
}

// Delete from documents
db.run('DELETE FROM documents WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting documents:', err);
return res.status(500).json({ message: 'Failed to delete employee documents' });
}

// Delete from activities
db.run('DELETE FROM activities WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting activities:', err);
return res.status(500).json({ message: 'Failed to delete employee activities' });
}

// Delete from onboarding_status
db.run('DELETE FROM onboarding_status WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting onboarding status:', err);
return res.status(500).json({ message: 'Failed to delete onboarding status' });
}

// Delete from onboarding_answers
db.run('DELETE FROM onboarding_answers WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting onboarding answers:', err);
return res.status(500).json({ message: 'Failed to delete onboarding answers' });
}

// Delete from attendance_records
db.run('DELETE FROM attendance_records WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting attendance records:', err);
return res.status(500).json({ message: 'Failed to delete attendance records' });
}

// Delete from login_logs
db.run('DELETE FROM login_logs WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting login logs:', err);
return res.status(500).json({ message: 'Failed to delete login logs' });
}

// Delete from account_logs
db.run('DELETE FROM account_logs WHERE user_id = ?', [id], function(err) {
if (err) {
console.error('Error deleting account logs:', err);
return res.status(500).json({ message: 'Failed to delete account logs' });
}

// Finally delete the user
db.run(
'DELETE FROM users WHERE id = ? AND role IN (?, ?)',
[id, 'employee', 'candidate'],
function(err) {
if (err) {
console.error('Error deleting user:', err);
return res.status(500).json({ message: 'Failed to delete employee' });
}

if (this.changes === 0) {
return res.status(404).json({ message: 'Employee not found' });
}

res.json({ message: 'Employee deleted successfully' });
}
);
});
});
});
});
});
});
});
});
} catch (error) {
console.error('Error deleting employee:', error);
res.status(500).json({ message: 'Failed to delete employee' });
}
});

// Finance routes
router.get('/finance/payroll-history', authenticateToken, requireAdmin, payrollController.getPayrollHistory);
router.get('/finance/payroll-history/:userId', authenticateToken, requireAdmin, payrollController.getPayrollByUser);
router.post('/finance/payroll-history', authenticateToken, requireAdmin, payrollController.createPayroll);
router.put('/finance/payroll-history/:id', authenticateToken, requireAdmin, payrollController.updatePayroll);
router.delete('/finance/payroll-history/:id', authenticateToken, requireAdmin, payrollController.deletePayroll);
router.post('/finance/payroll-history/generate-auto', authenticateToken, requireAdmin, payrollController.generateAutoPayroll);
router.post('/finance/payroll-history/manual', authenticateToken, requireAdmin, payrollController.manualPayrollEntry);
router.post('/finance/manual', authenticateToken, requireAdmin, payrollController.manualPayrollEntry);
router.post('/finance/payroll-history/bulk-upload', authenticateToken, requireAdmin, payrollController.bulkUploadPayroll);
router.get('/finance/payroll-history/export/report', authenticateToken, requireAdmin, payrollController.exportPayrollReport);
router.get('/finance/payrolls/export', authenticateToken, requireAdmin, payrollController.exportPayrolls);

router.get('/finance/reimbursements', authenticateToken, requireAdmin, reimbursementsController.getReimbursements);
router.get('/finance/reimbursements/:userId', authenticateToken, requireAdmin, reimbursementsController.getReimbursementsByUser);
router.post('/finance/reimbursements', authenticateToken, requireAdmin, reimbursementsController.createReimbursement);
router.put('/finance/reimbursements/:id', authenticateToken, requireAdmin, reimbursementsController.updateReimbursement);
router.delete('/finance/reimbursements/:id', authenticateToken, requireAdmin, reimbursementsController.deleteReimbursement);
router.post('/finance/reimbursements/:id/approve', authenticateToken, requireAdmin, reimbursementsController.approveReimbursement);
router.post('/finance/reimbursements/:id/reject', authenticateToken, requireAdmin, reimbursementsController.rejectReimbursement);
router.post('/finance/reimbursements/:id/mark-paid', authenticateToken, requireAdmin, reimbursementsController.markReimbursementAsPaid);

router.get('/finance/tax-declarations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const declarations = await TaxDeclarations.findAll();
    res.json(declarations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/finance/tax-declarations/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await TaxDeclarations.approve(id, req.user.id);
    if (success) {
      res.json({ message: 'Tax declaration approved' });
    } else {
      res.status(404).json({ error: 'Tax declaration not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/finance/tax-declarations/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const success = await TaxDeclarations.reject(id, req.user.id, rejectionReason);
    if (success) {
      res.json({ message: 'Tax declaration rejected' });
    } else {
      res.status(404).json({ error: 'Tax declaration not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/finance/salary-structure', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const structures = await SalaryStructure.findAll();
    res.json(structures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/finance/salary-structure/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const structure = await SalaryStructure.findByUserId(userId);
    if (structure) {
      res.json(structure);
    } else {
      res.status(404).json({ error: 'Salary structure not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/finance/salary-structure', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const structureData = req.body;
    const structure = await SalaryStructure.create(structureData);
    res.status(201).json(structure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/finance/salary-structure/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const success = await SalaryStructure.update(userId, updateData);
    if (success) {
      res.json({ message: 'Salary structure updated' });
    } else {
      res.status(404).json({ error: 'Salary structure not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/finance/generate-payslip/:payrollId', authenticateToken, requireAdmin, payslipController.generatePayslip);
router.get('/finance/download-payslip/:payrollId', authenticateToken, requireAdmin, payslipController.downloadPayslip);
router.post('/finance/send-payslip-email/:payrollId', authenticateToken, requireAdmin, payslipController.sendPayslipEmail);
router.post('/finance/send-payslip-sms/:payrollId', authenticateToken, requireAdmin, payslipController.sendPayslipSMS);

// Analytics route
router.get('/finance/analytics', authenticateToken, requireAdmin, payrollController.getAnalytics);

// Employee documents management routes - Get employees with their documents
router.get('/documents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.phone,
        u.position,
        u.onboarding_status,
        u.onboarding_step,
        u.createdAt,
        ep.photo,
        oa.data as onboardingData
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN onboarding_answers oa ON u.id = oa.user_id AND oa.step = 1
      WHERE u.role IN ('employee', 'candidate')
    `;

    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(u.fullName LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'all') {
      conditions.push('u.onboarding_status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY u.createdAt DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    db.all(query, params, (err, employees) => {
      if (err) {
        console.error('Error fetching employees:', err);
        return res.status(500).json({ message: 'Failed to fetch employees' });
      }

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE u.role IN (?, ?)';
      const countParams = ['employee', 'candidate'];

      if (search) {
        countQuery += ' AND (u.fullName LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'all') {
        countQuery += ' AND u.onboarding_status = ?';
        countParams.push(status);
      }

      db.get(countQuery, countParams, (err, countResult) => {
        if (err) {
          console.error('Error fetching employee count:', err);
          return res.status(500).json({ message: 'Failed to fetch employee count' });
        }

        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Process employees and get their documents
        const processedEmployees = employees.map(employee => {
          let onboardingData = {};
          try {
            if (employee.onboardingData) {
              if (typeof employee.onboardingData === 'string') {
                onboardingData = JSON.parse(employee.onboardingData);
              } else if (typeof employee.onboardingData === 'object') {
                onboardingData = employee.onboardingData;
              }
            }
          } catch (e) {
            console.error('Error parsing onboarding data:', e);
          }

          return {
            id: employee.id,
            fullName: employee.fullName || 'Unknown',
            email: employee.email,
            phone: employee.phone,
            position: employee.position,
            onboardingStatus: employee.onboarding_status || 'NOT_STARTED',
            onboardingStep: employee.onboarding_step || 0,
            createdAt: employee.createdAt,
            photo: employee.photo,
            onboardingData: onboardingData
          };
        });

        res.json({
          employees: processedEmployees,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// Get detailed employee information with all documents
router.get('/documents/:employeeId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee basic info
    db.get(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.phone,
        u.position,
        u.onboarding_status,
        u.onboarding_step,
        u.createdAt,
        ep.*
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.id = ? AND u.role IN ('employee', 'candidate')
    `, [employeeId], (err, employee) => {
      if (err) {
        console.error('Error fetching employee:', err);
        return res.status(500).json({ message: 'Failed to fetch employee' });
      }

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Get onboarding data
      db.all(`
        SELECT step, data, submitted_at
        FROM onboarding_answers
        WHERE user_id = ?
        ORDER BY step
      `, [employeeId], (err, onboardingSteps) => {
        if (err) {
          console.error('Error fetching onboarding data:', err);
          return res.status(500).json({ message: 'Failed to fetch onboarding data' });
        }

        // Get all documents for this employee
        db.all(`
          SELECT
            id,
            document_type,
            file_name,
            file_path,
            uploaded_at,
            status,
            approved_at,
            remarks
          FROM documents
          WHERE user_id = ?
          ORDER BY uploaded_at DESC
        `, [employeeId], (err, documents) => {
          if (err) {
            console.error('Error fetching documents:', err);
            return res.status(500).json({ message: 'Failed to fetch documents' });
          }

          // Process onboarding data
          const processedOnboardingData = {};
          onboardingSteps.forEach(step => {
            try {
              if (step.data) {
                if (typeof step.data === 'string') {
                  processedOnboardingData[`step${step.step}`] = JSON.parse(step.data);
                } else if (typeof step.data === 'object') {
                  processedOnboardingData[`step${step.step}`] = step.data;
                }
              }
            } catch (e) {
              console.error('Error parsing step data:', e);
            }
          });

          // Combine all data
          const employeeDetails = {
            ...employee,
            onboardingData: processedOnboardingData,
            documents: documents.map(doc => ({
              id: doc.id,
              type: doc.document_type,
              name: doc.file_name,
              path: doc.file_path,
              url: `http://localhost:5000${doc.file_path}`,
              uploadedAt: doc.uploaded_at,
              status: doc.status || 'SUBMITTED',
              approvedAt: doc.approved_at,
              remarks: doc.remarks
            }))
          };

          res.json(employeeDetails);
        });
      });
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ message: 'Failed to fetch employee details' });
  }
});

router.delete('/documents/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // First get document info for audit
    db.get(
      'SELECT d.file_path, u.fullName, u.email FROM documents d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [id],
      (err, docInfo) => {
        if (err) {
          console.error('Error fetching document info:', err);
          return res.status(500).json({ message: 'Failed to fetch document info' });
        }

        if (!docInfo) {
          return res.status(404).json({ message: 'Document not found' });
        }

        // Delete the document
        db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
          if (err) {
            console.error('Error deleting document:', err);
            return res.status(500).json({ message: 'Failed to delete document' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ message: 'Document not found' });
          }

          // Audit the deletion
          auditLog(null, adminId, 'DELETE_DOCUMENT', {
            deletedBy: req.user.email,
            documentId: id,
            fileName: docInfo.file_path,
            employeeName: docInfo.fullName,
            employeeEmail: docInfo.email
          }, req.ip, req.get('User-Agent'));

          res.json({ message: 'Document deleted successfully' });
        });
      }
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Attendance routes
router.get('/attendance/live', authenticateToken, requireAdmin, attendanceController.getLiveAttendance);
router.get('/attendance/analytics', authenticateToken, requireAdmin, attendanceController.getAttendanceAnalytics);
// Leave policy routes
router.get('/attendance/leave-policies', authenticateToken, requireAdmin, attendanceController.getLeavePolicies);
router.put('/attendance/leave-policies', authenticateToken, requireAdmin, attendanceController.updateLeavePolicy);
router.get('/attendance/leave-balances', authenticateToken, requireAdmin, attendanceController.getAllLeaveBalances);
router.post('/attendance/leave-balances/adjust', authenticateToken, requireAdmin, attendanceController.adjustLeaveBalance);
router.post('/attendance/leave-balances/accrual', authenticateToken, requireAdmin, attendanceController.runMonthlyLeaveAccrual);

module.exports = router;
