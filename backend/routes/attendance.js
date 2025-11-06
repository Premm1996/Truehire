const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

// ✅ New routes for frontend dashboard
// router.get('/latest/:userId', attendanceController.getLatestAttendance);
// router.get('/today/:userId', attendanceController.getTodayAttendance); // <-- 🔥 Added this

// Apply rate limiting to all routes
router.use(generalLimiter);

// All attendance routes require authentication
router.use(authenticateToken);

// Candidate routes
router.post('/punch-in', attendanceController.punchIn);
router.post('/punch-out', attendanceController.punchOut);
router.get('/today', attendanceController.getTodayStatus);
router.get('/monthly', attendanceController.getMonthlyAttendance);
router.post('/correction', attendanceController.requestCorrection);
router.get('/corrections', attendanceController.getCorrectionRequests);
router.get('/summary', attendanceController.getAttendanceSummary);
router.get('/summary/:id', attendanceController.getAttendanceSummary);
router.get('/today-month/:id', attendanceController.getTodayAndMonthlyAttendance);
router.get('/calendar/:id/:year/:month', attendanceController.getMonthlyAttendance);

// Break management routes
router.post('/break/start', attendanceController.startBreakWithReason);
router.post('/break/end', attendanceController.endBreak);
router.get('/breaks/today', attendanceController.getTodayBreaks);

// Leave management routes
router.post('/leave/request', attendanceController.requestLeave);
router.get('/leaves', attendanceController.getLeaveRequests);

// Work logs routes
router.post('/work-log', attendanceController.submitWorkLog);
router.get('/work-logs', attendanceController.getWorkLogs);
router.put('/work-log/:id', attendanceController.updateWorkLog);

// Timesheet routes
router.post('/timesheet/submit', attendanceController.submitTimesheet);

// Admin routes (require admin role)
router.get('/admin/corrections', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getAllCorrectionRequests);

router.post('/admin/corrections/process', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.processCorrection);

router.post('/admin/holidays', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.addHoliday);

router.get('/admin/holidays', attendanceController.getHolidays);

// Additional admin routes for comprehensive attendance management
router.get('/admin/attendance/live', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getLiveAttendance);

router.get('/admin/attendance/all', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getAllAttendanceRecords);

router.post('/admin/attendance/override', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.overrideAttendanceRecord);

router.get('/admin/attendance/reports', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getAttendanceReports);

router.get('/admin/attendance/analytics', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getAttendanceAnalytics);

router.get('/admin/attendance/monthly-user', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getAdminMonthlyAttendance);

router.delete('/admin/holidays/:id', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.deleteHoliday);

router.put('/admin/holidays/:id', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.updateHoliday);

// Admin leave management routes
router.get('/admin/leaves', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getAllLeaveRequests);

router.post('/admin/leaves/process', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.processLeaveRequest);

// Admin work logs routes
router.get('/admin/work-logs', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getAllWorkLogs);

router.get('/admin/work-logs/:userId', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getUserWorkLogs);

// Admin Reports Routes
router.get('/admin/reports/daily', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getDailyReport);

router.get('/admin/reports/weekly', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getWeeklyReport);

router.get('/admin/reports/monthly', (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}, attendanceController.getMonthlyReport);

module.exports = router;