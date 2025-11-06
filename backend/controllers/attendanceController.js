const { pool } = require('../db');
const moment = require('moment-timezone');
const socketService = require('../services/socketService');
const notificationService = require('../utils/notificationService');

/**
 * Calculates the total hours worked between punch in and punch out times
 * @param {string|Date} punchIn - The punch in timestamp
 * @param {string|Date} punchOut - The punch out timestamp
 * @returns {number} Total hours worked, rounded to 2 decimal places
 */
const calculateTotalHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return 0;
  const duration = moment.duration(moment(punchOut).diff(moment(punchIn)));
  return Math.round((duration.asHours() + Number.EPSILON) * 100) / 100;
};

/**
 * Checks if a date is a weekend or holiday
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<boolean>} True if weekend or holiday
 */
const isWeekendOrHoliday = async (date) => {
  // Check if today is weekend
  const [settings] = await pool.query(
    'SELECT setting_key, setting_value FROM attendance_settings WHERE setting_key = ?',
    ['weekend_days']
  );
  const weekendDays = (settings.length > 0 ? settings[0].setting_value : 'saturday,sunday').split(',');

  const dayOfWeek = moment(date).format('dddd').toLowerCase();
  if (weekendDays.includes(dayOfWeek)) {
    return true;
  }

  // Check if it's a holiday
  const [holidays] = await pool.query(
    'SELECT id FROM attendance_holidays WHERE holiday_date = ?',
    [date]
  );
  if (holidays.length > 0) {
    return true;
  }

  return false;
};

/**
 * Auto completes any active breaks for a user
 * @param {number} userId - User ID
 * @param {string} currentTime - Current timestamp
 * @returns {Promise<void>}
 */
const autoCompleteActiveBreaks = async (userId, currentTime) => {
  await pool.query(
    'UPDATE attendance_breaks SET break_end_time = ?, duration_minutes = TIMESTAMPDIFF(MINUTE, break_start_time, ?), status = ? WHERE user_id = ? AND status = ?',
    [currentTime, currentTime, 'completed', userId, 'active']
  );
};

// Auto punch in function for cron job
/**
 * Automatically punches in a user at the configured start time if they haven't already punched in
 * @param {number} userId - The ID of the user to auto-punch in
 * @param {string} date - The date for which to perform auto punch-in (YYYY-MM-DD format)
 * @returns {Promise<void>} - Resolves when auto punch-in is complete
 */
const autoPunchIn = async (userId, date) => {
  try {
    // Check if user already punched in today
    const [existingRecord] = await pool.query(
      'SELECT id, punch_in_time FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (existingRecord.length > 0 && existingRecord[0].punch_in_time) {
      // Already punched in
      return;
    }

    // Check if today is weekend or holiday
    const [settings] = await pool.query(
      'SELECT setting_key, setting_value FROM attendance_settings WHERE setting_key = ?',
      ['weekend_days']
    );
    const weekendDays = (settings.length > 0 ? settings[0].setting_value : 'saturday,sunday').split(',');

    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    if (weekendDays.includes(dayOfWeek)) {
      return;
    }

    const [holidays] = await pool.query(
      'SELECT id FROM attendance_holidays WHERE holiday_date = ?',
      [date]
    );
    if (holidays.length > 0) {
      return;
    }

    // Check if user is on approved leave today
    const [leaves] = await pool.query(
      'SELECT id FROM attendance_leaves WHERE user_id = ? AND ? BETWEEN start_date AND end_date AND status = ?',
      [userId, date, 'approved']
    );
    if (leaves.length > 0) {
      return;
    }

    // Perform punch in at configured start time (or current time)
    const punchInTime = moment.tz(date + ' 09:00:00', 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    if (existingRecord.length > 0) {
      await pool.query(
        'UPDATE attendance_records SET punch_in_time = ?, status = ? WHERE id = ?',
        [punchInTime, 'pending', existingRecord[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO attendance_records (user_id, date, punch_in_time, status) VALUES (?, ?, ?, ?)',
        [userId, date, punchInTime, 'pending']
      );
    }

    // Send notification to user about auto punch in
    const [user] = await pool.query('SELECT email, fullName FROM users WHERE id = ?', [userId]);
    if (user.length > 0) {
      notificationService.sendPunchInReminder(user[0].email, user[0].fullName).catch(err => {
        console.error('Error sending auto punch in notification:', err);
      });
    }
  } catch (error) {
    console.error('Error in autoPunchIn:', error);
  }
};

// Auto punch out function for cron job
/**
 * Automatically punches out a user at the configured end time if they haven't already punched out
 * @param {number} userId - The ID of the user to auto-punch out
 * @param {string} date - The date for which to perform auto punch-out (YYYY-MM-DD format)
 * @returns {Promise<void>} - Resolves when auto punch-out is complete
 */
const autoPunchOut = async (userId, date) => {
  try {
    // Get today's attendance record
    const [records] = await pool.query(
      'SELECT id, punch_in_time, punch_out_time FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (records.length === 0 || !records[0].punch_in_time) {
      // No punch in, no punch out
      return;
    }

    if (records[0].punch_out_time) {
      // Already punched out
      return;
    }

    // Check if today is weekend or holiday
    const [settings] = await pool.query(
      'SELECT setting_key, setting_value FROM attendance_settings WHERE setting_key = ?',
      ['weekend_days']
    );
    const weekendDays = (settings.length > 0 ? settings[0].setting_value : 'saturday,sunday').split(',');

    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    if (weekendDays.includes(dayOfWeek)) {
      return;
    }

    const [holidays] = await pool.query(
      'SELECT id FROM attendance_holidays WHERE holiday_date = ?',
      [date]
    );
    if (holidays.length > 0) {
      return;
    }

    // Check if user is on approved leave today
    const [leaves] = await pool.query(
      'SELECT id FROM attendance_leaves WHERE user_id = ? AND ? BETWEEN start_date AND end_date AND status = ?',
      [userId, date, 'approved']
    );
    if (leaves.length > 0) {
      return;
    }

    // Perform punch out at configured end time (or current time)
    const punchOutTime = moment.tz(date + ' 18:00:00', 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    const totalHours = calculateTotalHours(records[0].punch_in_time, punchOutTime);

    // Determine status based on total hours
    const status = await determineAttendanceStatus(totalHours, date);

    await pool.query(
      'UPDATE attendance_records SET punch_out_time = ?, total_hours = ?, status = ? WHERE id = ?',
      [punchOutTime, totalHours, status, records[0].id]
    );

    // Send notification to user about auto punch out
    const [user] = await pool.query('SELECT email, fullName FROM users WHERE id = ?', [userId]);
    if (user.length > 0) {
      notificationService.sendAutoPunchOutNotification(user[0].email, user[0].fullName).catch(err => {
        console.error('Error sending auto punch out notification:', err);
      });
    }
  } catch (error) {
    console.error('Error in autoPunchOut:', error);
  }
};

// Send punch in reminder notification
/**
 * Sends a punch-in reminder notification to a user if they haven't punched in yet
 * @param {number} userId - The ID of the user to send the reminder to
 * @param {string} date - The date for which to check punch-in status (YYYY-MM-DD format)
 * @returns {Promise<void>} - Resolves when the reminder process is complete
 */
const sendPunchInReminder = async (userId, date) => {
  try {
    // Check if user has punched in
    const [records] = await pool.query(
      'SELECT punch_in_time FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (records.length > 0 && records[0].punch_in_time) {
      // Already punched in, no reminder needed
      return;
    }

    // Send reminder notification (email or other)
    // Assuming notificationService is imported and available
    // Example: notificationService.sendAttendanceReminder(userId, 'punchIn');
  } catch (error) {
    console.error('Error sending punch in reminder:', error);
  }
};

// Send punch out reminder notification
/**
 * Sends a punch-out reminder notification to a user if they haven't punched out yet
 * @param {number} userId - The ID of the user to send the reminder to
 * @param {string} date - The date for which to check punch-out status (YYYY-MM-DD format)
 * @returns {Promise<void>} - Resolves when the reminder process is complete
 */
const sendPunchOutReminder = async (userId, date) => {
  try {
    // Check if user has punched out
    const [records] = await pool.query(
      'SELECT punch_out_time FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (records.length > 0 && records[0].punch_out_time) {
      // Already punched out, no reminder needed
      return;
    }

    // Send reminder notification (email or other)
    // Assuming notificationService is imported and available
    // Example: notificationService.sendAttendanceReminder(userId, 'punchOut');
  } catch (error) {
    console.error('Error sending punch out reminder:', error);
  }
};

// Helper function to determine attendance status
/**
 * Determines the attendance status based on total hours worked and date
 * @param {number} totalHours - Total hours worked in the day
 * @param {string} date - The date for which to determine status (YYYY-MM-DD format)
 * @returns {Promise<string>} The attendance status ('present', 'half-day', 'absent', 'week-off', 'holiday', or 'pending')
 */
const determineAttendanceStatus = async (totalHours, date) => {
  try {
    // Get settings from database
    const [settings] = await pool.query(
      'SELECT setting_key, setting_value FROM attendance_settings WHERE setting_key IN (?, ?, ?)',
      ['full_day_hours', 'half_day_hours', 'weekend_days']
    );

    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });

    const fullDayHours = parseFloat(settingsMap.full_day_hours || '7.5');
    const halfDayHours = parseFloat(settingsMap.half_day_hours || '7.0');
    const weekendDays = (settingsMap.weekend_days || 'saturday,sunday').split(',');

    // Check if it's a weekend
    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    if (weekendDays.includes(dayOfWeek)) {
      return 'week-off';
    }

    // Check if it's a holiday
    const [holidays] = await pool.query(
      'SELECT id FROM attendance_holidays WHERE holiday_date = ?',
      [date]
    );

    if (holidays.length > 0) {
      return 'holiday';
    }

    // Determine status based on hours
    if (totalHours >= fullDayHours) {
      return 'present';
    } else if (totalHours >= halfDayHours) {
      return 'half-day';
    } else if (totalHours > 0) {
      return 'absent';
    } else {
      return 'pending';
    }
  } catch (error) {
    console.error('Error determining attendance status:', error);
    return 'pending';
  }
};

// Punch In
/**
 * Handles employee punch-in functionality
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.id - ID of the user punching in
 * @param {Object} req.body - Request body containing location data
 * @param {number} [req.body.latitude] - Latitude coordinate
 * @param {number} [req.body.longitude] - Longitude coordinate
 * @param {string} [req.body.address] - Human-readable address
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with punch-in details or error
 */
/**
 * Handles employee punch-in functionality
 */
const punchIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, address } = req.body;
    const now = moment().tz('Asia/Kolkata');
    const today = now.format('YYYY-MM-DD');
    const currentTime = now.format('YYYY-MM-DD HH:mm:ss');

    console.log('Punch In Request:', { userId, today, currentTime }); // Debug log

    // Check if already punched in today
    const [existingRecord] = await pool.query(
      'SELECT id, punch_in_time, punch_out_time FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existingRecord.length > 0 && existingRecord[0].punch_in_time && !existingRecord[0].punch_out_time) {
      return res.status(400).json({
        message: 'Already punched in today. Please punch out first.',
        currentSession: existingRecord[0]
      });
    }

    // Auto complete any active breaks before punch in
    try {
      await pool.query(
        'UPDATE attendance_breaks SET break_end_time = ?, duration_minutes = TIMESTAMPDIFF(MINUTE, break_start_time, ?), status = ? WHERE user_id = ? AND status = ?',
        [currentTime, currentTime, 'completed', userId, 'active']
      );
    } catch (breakError) {
      console.log('Note: No active breaks to close or breaks table issue:', breakError.message);
    }

    // Create or update attendance record
    if (existingRecord.length > 0) {
      // Update existing record
      await pool.query(
        'UPDATE attendance_records SET punch_in_time = ?, status = ? WHERE id = ?',
        [currentTime, 'pending', existingRecord[0].id]
      );
      console.log('Updated existing record:', existingRecord[0].id);
    } else {
      // Insert new record
      await pool.query(
        'INSERT INTO attendance_records (user_id, date, punch_in_time, status) VALUES (?, ?, ?, ?)',
        [userId, today, currentTime, 'pending']
      );
      console.log('Created new attendance record');
    }

    // Emit socket event for real-time update (optional, won't fail if socketService doesn't exist)
    try {
      if (socketService && typeof socketService.emitToAll === 'function') {
        socketService.emitToAll('attendanceUpdate', {
          type: 'punchIn',
          userId,
          data: {
            punchInTime: currentTime,
            date: today,
            status: 'pending',
            location: latitude && longitude ? { latitude, longitude, address } : null
          }
        });
      }
    } catch (socketError) {
      console.log('Socket service unavailable:', socketError.message);
    }

    res.json({
      message: 'Punched in successfully',
      punchInTime: currentTime,
      date: today,
      location: latitude && longitude ? { latitude, longitude, address } : null
    });

  } catch (error) {
    console.error('❌ Error punching in:', error);
    res.status(500).json({
      message: 'Server error during punch in',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Punch Out
/**
 * Handles employee punch-out functionality
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.id - ID of the user punching out
 * @param {Object} req.body - Request body containing location data
 * @param {number} [req.body.latitude] - Latitude coordinate
 * @param {number} [req.body.longitude] - Longitude coordinate
 * @param {string} [req.body.address] - Human-readable address
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with punch-out details or error
 */
const punchOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, address } = req.body;
    const now = moment().tz('Asia/Kolkata');
    const today = now.format('YYYY-MM-DD');
    const currentTime = now.format('YYYY-MM-DD HH:mm:ss');

    // Get today's attendance record
    const [records] = await pool.query(
      'SELECT id, punch_in_time FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (records.length === 0 || !records[0].punch_in_time) {
      return res.status(400).json({ message: 'No active punch in found for today' });
    }

    // Auto punch out any active breaks before punch out
    await pool.query(
      'UPDATE attendance_breaks SET break_end_time = ?, duration_minutes = TIMESTAMPDIFF(MINUTE, break_start_time, ?), status = ? WHERE user_id = ? AND status = ?',
      [currentTime, currentTime, 'completed', userId, 'active']
    );

    const record = records[0];
    const totalHours = calculateTotalHours(record.punch_in_time, currentTime);
    const status = await determineAttendanceStatus(totalHours, today);

    // Calculate total break duration for the day
    const [breakData] = await pool.query(
      'SELECT SUM(duration_minutes) as total_break_duration FROM attendance_breaks WHERE user_id = ? AND DATE(break_start_time) = ?',
      [userId, today]
    );
    const totalBreakDuration = breakData[0].total_break_duration || 0;
    const productionHours = Math.max(0, totalHours - (totalBreakDuration / 60));

    // Update the record with location data
    await pool.query(
      'UPDATE attendance_records SET punch_out_time = ?, total_hours = ?, status = ?, break_duration = ?, production_hours = ?, end_location_lat = ?, end_location_lng = ?, end_location_address = ? WHERE id = ?',
      [currentTime, totalHours, status, totalBreakDuration, productionHours, latitude || null, longitude || null, address || null, record.id]
    );

    // Emit socket event for real-time update
    socketService.emitToAll('attendanceUpdate', {
      type: 'punchOut',
      userId,
      data: {
        punchOutTime: currentTime,
        totalHours,
        status,
        date: today,
        location: latitude && longitude ? { latitude, longitude, address } : null
      }
    });

    res.json({
      message: 'Punched out successfully',
      punchOutTime: currentTime,
      totalHours,
      status,
      location: latitude && longitude ? { latitude, longitude, address } : null
    });
  } catch (error) {
    console.error('Error punching out:', error);
    res.status(500).json({ message: 'Server error during punch out' });
  }
};

// Get current day's attendance status
/**
 * Retrieves the current day's attendance status for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.id - ID of the user requesting status
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with today's attendance details or error
 */
const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    const [records] = await pool.query(
      'SELECT id, punch_in_time, punch_out_time, total_hours, status, production_hours FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    // Get today's breaks
    const [breaks] = await pool.query(
      'SELECT id, attendance_record_id, user_id, break_start_time as break_start, break_end_time as break_end_time, duration_minutes, status, break_reason as reason, break_note FROM attendance_breaks WHERE user_id = ? AND DATE(break_start_time) = ? ORDER BY break_start_time DESC',
      [userId, today]
    );

    if (records.length === 0) {
      return res.json({
        punchInTime: null,
        punchOutTime: null,
        totalHours: 0,
        breakCount: 0,
        totalBreakDuration: 0,
        productionHours: 0,
        status: 'Not Started',
        progress: 0
      });
    }

    const record = records[0];
    const now = moment().tz('Asia/Kolkata');
    let currentSessionHours = 0;

    if (record.punch_in_time && !record.punch_out_time) {
      currentSessionHours = calculateTotalHours(record.punch_in_time, now.format('YYYY-MM-DD HH:mm:ss'));
    }

    // Calculate break statistics
    const completedBreaks = breaks.filter(breakItem => breakItem.status === 'completed');
    const breakCount = completedBreaks.length;
    const totalBreakDuration = completedBreaks.reduce((total, breakItem) => {
      return total + (breakItem.duration_minutes || 0);
    }, 0);

    // Calculate production hours (total hours minus break duration in hours)
    const totalBreakHours = totalBreakDuration / 60; // Convert minutes to hours
    const productionHours = Math.max(0, (record.total_hours || currentSessionHours) - totalBreakHours);

    // Calculate progress towards 9-hour target
    const targetHours = 9;
    const progress = Math.min(100, Math.round(((record.total_hours || currentSessionHours) / targetHours) * 100));

    // Map status to user-friendly labels
    let status = record.status;
    switch (record.status) {
      case 'present':
        status = 'Checked In';
        break;
      case 'absent':
        status = 'No Show';
        break;
      case 'half-day':
        status = 'Check in Delay';
        break;
      case 'pending':
        status = 'Pending';
        break;
      case 'week-off':
        status = 'Week Off';
        break;
      case 'holiday':
        status = 'Holiday';
        break;
      default:
        status = record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Not Started';
    }

    res.json({
      punchInTime: record.punch_in_time,
      punchOutTime: record.punch_out_time,
      totalHours: record.total_hours || currentSessionHours,
      breakCount,
      totalBreakDuration,
      productionHours: Math.round(productionHours * 100) / 100,
      status,
      progress
    });
  } catch (error) {
    console.error('Error getting today status:', error);
    res.status(500).json({ message: 'Server error getting attendance status' });
  }
};

// Get weekly attendance data for employee dashboard
/**
 * Retrieves the weekly attendance data for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.id - ID of the user requesting attendance data
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.weekStart - Start date of the week (YYYY-MM-DD format, optional)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with weekly attendance data or error
 */
const getWeeklyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekStart } = req.query;

    // Calculate week start and end dates
    const startDate = weekStart ? moment(weekStart) : moment().startOf('week');
    const endDate = moment(startDate).endOf('week');

    const startDateStr = startDate.format('YYYY-MM-DD');
    const endDateStr = endDate.format('YYYY-MM-DD');

    // Get attendance records for the week
    const [records] = await pool.query(
      'SELECT date, status, total_hours, punch_in_time, punch_out_time FROM attendance_records WHERE user_id = ? AND date BETWEEN ? AND ?',
      [userId, startDateStr, endDateStr]
    );

    // Get breaks for the week
    const [breaks] = await pool.query(
      'SELECT DATE(break_start_time) as date, COUNT(*) as break_count, SUM(duration_minutes) as total_break_duration FROM attendance_breaks WHERE user_id = ? AND DATE(break_start_time) BETWEEN ? AND ? GROUP BY DATE(break_start_time)',
      [userId, startDateStr, endDateStr]
    );

    // Get holidays for the week
    const [holidays] = await pool.query(
      'SELECT holiday_date, holiday_name FROM attendance_holidays WHERE holiday_date BETWEEN ? AND ?',
      [startDateStr, endDateStr]
    );

    // Get leave requests for the week
    const [leaves] = await pool.query(
      'SELECT start_date, end_date, leave_type, status FROM attendance_leaves WHERE user_id = ? AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?)) AND status = ?',
      [userId, startDateStr, endDateStr, startDateStr, endDateStr, startDateStr, endDateStr, 'approved']
    );

    // Create weekly data structure
    const weeklyData = {};
    const breaksMap = {};
    const holidaysMap = {};
    const leavesMap = {};

    // Map breaks by date
    breaks.forEach(breakItem => {
      breaksMap[breakItem.date] = {
        count: breakItem.break_count,
        duration: breakItem.total_break_duration
      };
    });

    // Map holidays by date
    holidays.forEach(holiday => {
      holidaysMap[holiday.holiday_date] = holiday.holiday_name;
    });

    // Map leaves by date
    leaves.forEach(leave => {
      const leaveStart = moment(leave.start_date);
      const leaveEnd = moment(leave.end_date);
      for (let date = leaveStart.clone(); date.isSameOrBefore(leaveEnd); date.add(1, 'days')) {
        const dateStr = date.format('YYYY-MM-DD');
        if (dateStr >= startDateStr && dateStr <= endDateStr) {
          leavesMap[dateStr] = {
            type: leave.leave_type,
            status: leave.status
          };
        }
      }
    });

    // Create data for each day of the week
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'days')) {
      const dateStr = date.format('YYYY-MM-DD');
      const record = records.find(r => r.date === dateStr);
      const breakData = breaksMap[dateStr];
      const holiday = holidaysMap[dateStr];
      const leave = leavesMap[dateStr];

      weeklyData[dateStr] = {
        date: dateStr,
        dayOfWeek: date.format('dddd'),
        status: record ? record.status : (holiday ? 'holiday' : (leave ? 'leave' : 'not-recorded')),
        totalHours: record ? record.total_hours : 0,
        productionHours: record ? (record.total_hours - (breakData ? breakData.duration / 60 : 0)) : 0,
        punchInTime: record ? record.punch_in_time : null,
        punchOutTime: record ? record.punch_out_time : null,
        breakCount: breakData ? breakData.count : 0,
        totalBreakDuration: breakData ? breakData.duration : 0,
        holidayName: holiday || null,
        leaveType: leave ? leave.type : null,
        leaveStatus: leave ? leave.status : null
      };
    }

    // Calculate weekly summary
    const summary = {
      totalHours: records.reduce((sum, record) => sum + (record.total_hours || 0), 0),
      totalProductionHours: Object.values(weeklyData).reduce((sum, day) => sum + (day.productionHours || 0), 0),
      totalBreakDuration: Object.values(weeklyData).reduce((sum, day) => sum + (day.totalBreakDuration || 0), 0),
      presentDays: records.filter(r => r.status === 'present').length,
      halfDays: records.filter(r => r.status === 'half-day').length,
      absentDays: records.filter(r => r.status === 'absent').length,
      weekOffDays: records.filter(r => r.status === 'week-off').length,
      holidayDays: Object.keys(holidaysMap).length,
      leaveDays: Object.keys(leavesMap).length
    };

    res.json({
      weeklyData,
      summary,
      period: { startDate: startDateStr, endDate: endDateStr }
    });
  } catch (error) {
    console.error('Error getting weekly attendance:', error);
    res.status(500).json({ message: 'Server error getting weekly attendance' });
  }
};

// Get monthly attendance calendar
/**
 * Retrieves the monthly attendance calendar for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.id - ID of the user requesting attendance data
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.year - Year for which to retrieve attendance (e.g., 2024)
 * @param {number} req.query.month - Month for which to retrieve attendance (1-12)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with monthly attendance calendar data or error
 */
const getMonthlyAttendance = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { year, month } = req.params;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');

    // Get attendance records for the month
    const [records] = await pool.query(
      'SELECT date, status, total_hours, punch_in_time, punch_out_time FROM attendance_records WHERE user_id = ? AND date BETWEEN ? AND ?',
      [userId, startDate, endDate]
    );

    // Get holidays for the month
    const [holidays] = await pool.query(
      'SELECT holiday_date, holiday_name FROM attendance_holidays WHERE holiday_date BETWEEN ? AND ?',
      [startDate, endDate]
    );

    // Get approved leaves for the month
    const [leaves] = await pool.query(
      'SELECT start_date, end_date, leave_type FROM attendance_leaves WHERE user_id = ? AND status = ? AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?))',
      [userId, 'approved', startDate, endDate, startDate, endDate, startDate, endDate]
    );

    // Create calendar data
    const calendarData = {};
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    for (let date = startMoment.clone(); date.isSameOrBefore(endMoment); date.add(1, 'days')) {
      const dateStr = date.format('YYYY-MM-DD');
      const record = records.find(r => r.date === dateStr);
      const holiday = holidays.find(h => h.holiday_date === dateStr);
      const leave = leaves.find(l => dateStr >= l.start_date && dateStr <= l.end_date);

      calendarData[dateStr] = {
        date: dateStr,
        status: record ? record.status : (holiday ? 'holiday' : (leave ? 'leave' : 'not-recorded')),
        totalHours: record ? record.total_hours : 0,
        punchInTime: record ? record.punch_in_time : null,
        punchOutTime: record ? record.punch_out_time : null,
        holidayName: holiday ? holiday.holiday_name : null,
        leaveType: leave ? leave.leave_type : null,
        dayOfWeek: date.format('dddd')
      };
    }

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      calendarData
    });
  } catch (error) {
    console.error('Error getting monthly attendance:', error);
    res.status(500).json({ message: 'Server error getting monthly attendance' });
  }
};

// Request attendance correction
/**
 * Handles employee attendance correction requests
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.id - ID of the user requesting correction
 * @param {Object} req.body - Request body
 * @param {string} req.body.date - Date for which correction is requested (YYYY-MM-DD format)
 * @param {string} [req.body.requestedPunchIn] - Requested punch-in time (optional)
 * @param {string} [req.body.requestedPunchOut] - Requested punch-out time (optional)
 * @param {string} req.body.reason - Reason for the correction request
 * @param {string} [req.body.document] - Path to supporting document (optional)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with success message or error
 */
const requestCorrection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, requestedPunchIn, requestedPunchOut, reason, document } = req.body;

    if (!date || !reason) {
      return res.status(400).json({ message: 'Date and reason are required' });
    }

    // Check if correction already exists for this date
    const [existing] = await pool.query(
      'SELECT id FROM attendance_corrections WHERE user_id = ? AND date = ? AND status = ?',
      [userId, date, 'pending']
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Correction request already exists for this date' });
    }

    await pool.query(
      'INSERT INTO attendance_corrections (user_id, date, requested_punch_in, requested_punch_out, reason, document_path) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, date, requestedPunchIn, requestedPunchOut, reason, document]
    );

    res.json({ message: 'Correction request submitted successfully' });
  } catch (error) {
    console.error('Error requesting correction:', error);
    res.status(500).json({ message: 'Server error submitting correction request' });
  }
};

// Get user's correction requests
/**
 * Retrieves all correction requests submitted by the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.id - ID of the user requesting correction requests
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with array of correction requests or error
 */
const getCorrectionRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [requests] = await pool.query(
      'SELECT id, user_id, date, requested_punch_in, requested_punch_out, reason, document_path, status, admin_remarks, reviewed_by, reviewed_at, created_at FROM attendance_corrections WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(requests);
  } catch (error) {
    console.error('Error getting correction requests:', error);
    res.status(500).json({ message: 'Server error getting correction requests' });
  }
};

// Admin: Get all correction requests
/**
 * Retrieves all correction requests from all users for admin review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response with array of all correction requests including user details or error
 */
const getAllCorrectionRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT c.id, c.user_id, c.date, c.requested_punch_in, c.requested_punch_out, c.reason, c.document_path, c.status, c.admin_remarks, c.reviewed_by, c.reviewed_at, c.created_at, u.fullName, u.email
      FROM attendance_corrections c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    res.json(requests);
  } catch (error) {
    console.error('Error getting all correction requests:', error);
    res.status(500).json({ message: 'Server error getting correction requests' });
  }
};

// Admin: Approve/Reject correction
const processCorrection = async (req, res) => {
  try {
    const { id, action, remarks } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    await pool.query(
      'UPDATE attendance_corrections SET status = ?, admin_remarks = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [status, remarks, adminId, id]
    );

    // If approved, update the attendance record
    if (action === 'approve') {
      const [correction] = await pool.query(
        'SELECT id, user_id, date, requested_punch_in, requested_punch_out FROM attendance_corrections WHERE id = ?',
        [id]
      );

      if (correction.length > 0) {
        const corr = correction[0];
        const totalHours = calculateTotalHours(corr.requested_punch_in, corr.requested_punch_out);
        const newStatus = await determineAttendanceStatus(totalHours, corr.date);

        // Update or insert attendance record
        await pool.query(`
          INSERT INTO attendance_records (user_id, date, punch_in_time, punch_out_time, total_hours, status)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          punch_in_time = VALUES(punch_in_time),
          punch_out_time = VALUES(punch_out_time),
          total_hours = VALUES(total_hours),
          status = VALUES(status)
        `, [corr.user_id, corr.date, corr.requested_punch_in, corr.requested_punch_out, totalHours, newStatus]);
      }
    }

    res.json({ message: `Correction ${status} successfully` });
  } catch (error) {
    console.error('Error processing correction:', error);
    res.status(500).json({ message: 'Server error processing correction' });
  }
};

// Admin: Add holiday
const addHoliday = async (req, res) => {
  try {
    const { date, name, type } = req.body;
    const adminId = req.user.id;

    if (!date || !name) {
      return res.status(400).json({ message: 'Date and name are required' });
    }

    await pool.query(
      'INSERT INTO attendance_holidays (holiday_date, holiday_name, holiday_type, created_by) VALUES (?, ?, ?, ?)',
      [date, name, type || 'company', adminId]
    );

    res.json({ message: 'Holiday added successfully' });
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ message: 'Server error adding holiday' });
  }
};

// Get all holidays
const getHolidays = async (req, res) => {
  try {
    const [holidays] = await pool.query(
      'SELECT id, holiday_date, holiday_name, holiday_type, created_by, created_at FROM attendance_holidays ORDER BY holiday_date DESC'
    );

    res.json(holidays);
  } catch (error) {
    console.error('Error getting holidays:', error);
    res.status(500).json({ message: 'Server error getting holidays' });
  }
};

// Get attendance summary for user
const getAttendanceSummary = async (req, res) => {
  try {
    let userId = req.user.id;
    if (req.params.id && (req.user.role === 'admin' || req.user.is_admin)) {
      const parsedId = parseInt(req.params.id);
      if (isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({ message: 'Invalid user ID provided' });
      }
      userId = parsedId;
    }
    const { year, month } = req.query;

    const startDate = year && month ?
      moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD') :
      moment().startOf('month').format('YYYY-MM-DD');

    const endDate = year && month ?
      moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD') :
      moment().endOf('month').format('YYYY-MM-DD');

    const [records] = await pool.query(
      'SELECT status, COUNT(*) as count FROM attendance_records WHERE user_id = ? AND date BETWEEN ? AND ? GROUP BY status',
      [userId, startDate, endDate]
    );

    const summary = {
      present: 0,
      'half-day': 0,
      absent: 0,
      'week-off': 0,
      holiday: 0,
      pending: 0,
      totalDays: 0
    };

    records.forEach(record => {
      summary[record.status] = record.count;
      summary.totalDays += record.count;
    });

    const presentPercentage = summary.totalDays > 0 ?
      Math.round(((summary.present + summary['half-day'] * 0.5) / summary.totalDays) * 100) : 0;

    res.json({
      summary,
      presentPercentage,
      period: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    res.status(500).json({ message: 'Server error getting attendance summary' });
  }
};

// Admin: Get all attendance records for all users
const getAllAttendanceRecords = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, date, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (userId) {
      whereClause += ' AND ar.user_id = ?';
      params.push(userId);
    }

    if (date) {
      whereClause += ' AND ar.date = ?';
      params.push(date);
    }

    if (status) {
      whereClause += ' AND ar.status = ?';
      params.push(status);
    }

    if (startDate && endDate) {
      whereClause += ' AND ar.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [records] = await pool.query(`
      SELECT ar.id, ar.user_id, ar.date, ar.punch_in_time, ar.punch_out_time, ar.total_hours, ar.production_hours, ar.break_duration, ar.status, ar.is_auto_closed, ar.timezone, ar.created_at, ar.updated_at, u.fullName, u.email, u.position
      FROM attendance_records ar
      JOIN users u ON ar.user_id = u.id
      WHERE 1=1 ${whereClause}
      ORDER BY ar.date DESC, ar.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [totalCount] = await pool.query(`
      SELECT COUNT(*) as count
      FROM attendance_records ar
      WHERE 1=1 ${whereClause}
    `, params);

    res.json({
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all attendance records:', error);
    res.status(500).json({ message: 'Server error getting attendance records' });
  }
};

// Admin: Override attendance record
const overrideAttendanceRecord = async (req, res) => {
  try {
    const { userId, date, punchInTime, punchOutTime, status, reason } = req.body;
    const adminId = req.user.id;

    if (!userId || !date) {
      return res.status(400).json({ message: 'User ID and date are required' });
    }

    const totalHours = punchInTime && punchOutTime ? calculateTotalHours(punchInTime, punchOutTime) : 0;
    const finalStatus = status || (totalHours > 0 ? await determineAttendanceStatus(totalHours, date) : 'absent');

    // Insert or update attendance record
    await pool.query(`
      INSERT INTO attendance_records (user_id, date, punch_in_time, punch_out_time, total_hours, status, is_admin_override, override_reason, overridden_by)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      ON DUPLICATE KEY UPDATE
      punch_in_time = VALUES(punch_in_time),
      punch_out_time = VALUES(punch_out_time),
      total_hours = VALUES(total_hours),
      status = VALUES(status),
      is_admin_override = 1,
      override_reason = VALUES(override_reason),
      overridden_by = VALUES(overridden_by),
      updated_at = NOW()
    `, [userId, date, punchInTime, punchOutTime, totalHours, finalStatus, reason, adminId]);

    res.json({ message: 'Attendance record overridden successfully' });
  } catch (error) {
    console.error('Error overriding attendance record:', error);
    res.status(500).json({ message: 'Server error overriding attendance record' });
  }
};

// Admin: Get attendance reports
const getAttendanceReports = async (req, res) => {
  try {
    const { startDate, endDate, department, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    let departmentFilter = '';
    let params = [startDate, endDate];

    if (department) {
      departmentFilter = ' AND u.position LIKE ?';
      params.push(`%${department}%`);
    }

    const [reportData] = await pool.query(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.position,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN ar.status = 'half-day' THEN 1 END) as half_days,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN ar.status = 'week-off' THEN 1 END) as week_off_days,
        COUNT(CASE WHEN ar.status = 'holiday' THEN 1 END) as holiday_days,
        SUM(ar.total_hours) as total_hours,
        AVG(ar.total_hours) as avg_daily_hours
      FROM users u
      LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date BETWEEN ? AND ?
      WHERE u.role != 'admin' ${departmentFilter}
      GROUP BY u.id, u.fullName, u.email, u.position
      ORDER BY u.fullName
    `, params);

    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'Name,Email,Position,Present Days,Half Days,Absent Days,Week-off Days,Holiday Days,Total Hours,Avg Daily Hours\n';
      const csvRows = reportData.map(row =>
        `"${row.fullName}","${row.email}","${row.position}",${row.present_days},${row.half_days},${row.absent_days},${row.week_off_days},${row.holiday_days},${row.total_hours || 0},${row.avg_daily_hours || 0}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
      res.send(csvHeader + csvRows);
    } else {
      res.json({
        report: reportData,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error generating attendance reports:', error);
    res.status(500).json({ message: 'Server error generating reports' });
  }
};

// Admin: Get attendance analytics
const getAttendanceAnalytics = async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = year || moment().year();
    const targetMonth = month || moment().month() + 1;

    const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(`${targetYear}-${targetMonth}-01`).endOf('month').format('YYYY-MM-DD');

    // Overall attendance statistics
    const [overallStats] = await pool.query(`
      SELECT
        COUNT(CASE WHEN status = 'present' THEN 1 END) as total_present,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as total_half_day,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as total_absent,
        COUNT(CASE WHEN status = 'week-off' THEN 1 END) as total_week_off,
        COUNT(CASE WHEN status = 'holiday' THEN 1 END) as total_holiday,
        COUNT(*) as total_records,
        AVG(total_hours) as avg_hours_per_day
      FROM attendance_records
      WHERE date BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Daily attendance trends
    const [dailyTrends] = await pool.query(`
      SELECT
        date,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        AVG(total_hours) as avg_hours
      FROM attendance_records
      WHERE date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date
    `, [startDate, endDate]);

    // Department-wise statistics
    const [departmentStats] = await pool.query(`
      SELECT
        u.position as department,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_days,
        AVG(ar.total_hours) as avg_hours
      FROM users u
      LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date BETWEEN ? AND ?
      WHERE u.role != 'admin'
      GROUP BY u.position
      ORDER BY u.position
    `, [startDate, endDate]);

    res.json({
      period: { year: targetYear, month: targetMonth, startDate, endDate },
      overallStats: overallStats[0],
      dailyTrends,
      departmentStats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting attendance analytics:', error);
    res.status(500).json({ message: 'Server error getting analytics' });
  }
};

// Admin: Delete holiday
const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM attendance_holidays WHERE id = ?', [id]);

    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ message: 'Server error deleting holiday' });
  }
};

// Admin: Update holiday
const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, name, type } = req.body;

    if (!date || !name) {
      return res.status(400).json({ message: 'Date and name are required' });
    }

    await pool.query(
      'UPDATE attendance_holidays SET holiday_date = ?, holiday_name = ?, holiday_type = ? WHERE id = ?',
      [date, name, type || 'company', id]
    );

    res.json({ message: 'Holiday updated successfully' });
  } catch (error) {
    console.error('Error updating holiday:', error);
    res.status(500).json({ message: 'Server error updating holiday' });
  }
};

// Start Break
const startBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = moment().tz('Asia/Kolkata');
    const today = now.format('YYYY-MM-DD');
    const currentTime = now.format('YYYY-MM-DD HH:mm:ss');

    // Check if user is punched in today
    const [attendanceRecord] = await pool.query(
      'SELECT id FROM attendance_records WHERE user_id = ? AND date = ? AND punch_in_time IS NOT NULL AND punch_out_time IS NULL',
      [userId, today]
    );

    if (attendanceRecord.length === 0) {
      return res.status(400).json({ message: 'You must be punched in to start a break' });
    }

    // Check if there's already an active break
    const [activeBreak] = await pool.query(
      'SELECT id FROM attendance_breaks WHERE user_id = ? AND status = ?',
      [userId, 'active']
    );

    if (activeBreak.length > 0) {
      return res.status(400).json({ message: 'You already have an active break' });
    }

    // Start new break
    await pool.query(
      'INSERT INTO attendance_breaks (user_id, attendance_record_id, break_start_time, status) VALUES (?, ?, ?, ?)',
      [userId, attendanceRecord[0].id, currentTime, 'active']
    );

    // Emit socket event for real-time update
    socketService.emitToAll('attendanceUpdate', {
      type: 'startBreak',
      userId,
      data: {
        breakStartTime: currentTime,
        date: today,
        status: 'active'
      }
    });

    res.json({
      message: 'Break started successfully',
      breakStartTime: currentTime
    });
  } catch (error) {
    console.error('Error starting break:', error);
    res.status(500).json({ message: 'Server error starting break' });
  }
};

// End Break
const endBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = moment().tz('Asia/Kolkata');
    const currentTime = now.format('YYYY-MM-DD HH:mm:ss');

    // Find active break
    const [activeBreak] = await pool.query(
      'SELECT id, break_start_time FROM attendance_breaks WHERE user_id = ? AND status = ?',
      [userId, 'active']
    );

    if (activeBreak.length === 0) {
      return res.status(400).json({ message: 'No active break found' });
    }

    const breakRecord = activeBreak[0];
    const breakDuration = moment.duration(moment(currentTime).diff(moment(breakRecord.break_start_time))).asMinutes();

    // Update break record
    await pool.query(
      'UPDATE attendance_breaks SET break_end_time = ?, duration_minutes = ?, status = ? WHERE id = ?',
      [currentTime, Math.round(breakDuration), 'completed', breakRecord.id]
    );

    // Emit socket event for real-time update
    socketService.emitToAll('attendanceUpdate', {
      type: 'endBreak',
      userId,
      data: {
        breakEndTime: currentTime,
        breakDuration: Math.round(breakDuration),
        date: moment().tz('Asia/Kolkata').format('YYYY-MM-DD'),
        status: 'completed'
      }
    });

    res.json({
      message: 'Break ended successfully',
      breakEndTime: currentTime,
      breakDuration: Math.round(breakDuration)
    });
  } catch (error) {
    console.error('Error ending break:', error);
    res.status(500).json({ message: 'Server error ending break' });
  }
};

// Get today's breaks
const getTodayBreaks = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    const [breaks] = await pool.query(
      'SELECT id, attendance_record_id, user_id, break_start_time as start, break_end_time as break_end_time, duration_minutes as duration, status, break_reason as reason, break_note FROM attendance_breaks WHERE user_id = ? AND DATE(break_start_time) = ? ORDER BY break_start_time DESC',
      [userId, today]
    );

    // Calculate total break duration for the day
    const [breakData] = await pool.query(
      'SELECT SUM(duration_minutes) as total_break_duration FROM attendance_breaks WHERE user_id = ? AND DATE(break_start_time) = ?',
      [userId, today]
    );

    // Handle null fields by providing defaults
    const processedBreaks = breaks.map(breakItem => ({
      ...breakItem,
      reason: breakItem.reason || '',
      end: breakItem.break_end_time || null
    }));

    res.json({
      breaks: processedBreaks,
      totalBreakDuration: breakData[0].total_break_duration || 0
    });
  } catch (error) {
    console.error('Error getting today breaks:', error);
    res.status(500).json({ message: 'Server error getting breaks' });
  }
};

// Request Leave
const requestLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check leave policy compliance
    const policyCheck = await checkLeavePolicy(userId, leaveType, startDate, endDate);
    if (!policyCheck.valid) {
      return res.status(400).json({ message: policyCheck.message });
    }

    // Calculate total leave days
    const totalDays = policyCheck.leaveDays;

    await pool.query(
      'INSERT INTO attendance_leaves (user_id, leave_type, start_date, end_date, total_days, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, leaveType, startDate, endDate, totalDays, reason]
    );

    res.json({ message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error('Error requesting leave:', error);
    res.status(500).json({ message: 'Server error submitting leave request' });
  }
};

// Get user's leave requests
const getLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [requests] = await pool.query(
      'SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, status, admin_remarks, reviewed_by, reviewed_at, created_at FROM attendance_leaves WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(requests);
  } catch (error) {
    console.error('Error getting leave requests:', error);
    res.status(500).json({ message: 'Server error getting leave requests' });
  }
};

// Admin: Get all leave requests
const getAllLeaveRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT l.id, l.user_id, l.leave_type, l.start_date, l.end_date, l.total_days, l.reason, l.status, l.admin_remarks, l.reviewed_by, l.reviewed_at, l.created_at, u.fullName, u.email
      FROM attendance_leaves l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `);

    res.json(requests);
  } catch (error) {
    console.error('Error getting all leave requests:', error);
    res.status(500).json({ message: 'Server error getting leave requests' });
  }
};

// Admin: Process leave request
const processLeaveRequest = async (req, res) => {
  try {
    const { id, action, remarks } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    await pool.query(
      'UPDATE attendance_leaves SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      [status, adminId, id]
    );

    res.json({ message: `Leave request ${status} successfully` });
  } catch (error) {
    console.error('Error processing leave request:', error);
    res.status(500).json({ message: 'Server error processing leave request' });
  }
};

// Admin: Get Daily Report
const getDailyReport = async (req, res) => {
  try {
    const { date, department, format = 'json' } = req.query;
    const targetDate = date || moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    let departmentFilter = '';
    let params = [targetDate];

    if (department) {
      departmentFilter = ' AND u.position LIKE ?';
      params.push(`%${department}%`);
    }

    const [reportData] = await pool.query(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.position,
        ar.punch_in_time,
        ar.punch_out_time,
        ar.total_hours,
        ar.status,
        COUNT(ab.id) as break_count,
        SUM(ab.duration_minutes) as total_break_duration,
        GROUP_CONCAT(DISTINCT l.leave_type) as leave_types,
        GROUP_CONCAT(DISTINCT l.status) as leave_statuses
      FROM users u
      LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date = ?
      LEFT JOIN attendance_breaks ab ON u.id = ab.user_id AND DATE(ab.break_start) = ?
      LEFT JOIN attendance_leaves l ON u.id = l.user_id AND ? BETWEEN l.start_date AND l.end_date
      WHERE u.role != 'admin' ${departmentFilter}
      GROUP BY u.id, u.fullName, u.email, u.position, ar.punch_in_time, ar.punch_out_time, ar.total_hours, ar.status
      ORDER BY u.fullName
    `, [targetDate, targetDate, targetDate]);

    const report = reportData.map(row => ({
      employeeId: row.id,
      employeeName: row.fullName,
      email: row.email,
      department: row.position,
      punchInTime: row.punch_in_time,
      punchOutTime: row.punch_out_time,
      totalHours: row.total_hours || 0,
      breakCount: row.break_count || 0,
      totalBreakDuration: row.total_break_duration || 0,
      attendanceStatus: row.status || 'not-recorded',
      leaveTypes: row.leave_types ? row.leave_types.split(',') : [],
      leaveStatuses: row.leave_statuses ? row.leave_statuses.split(',') : [],
      overtime: row.total_hours > 8 ? row.total_hours - 8 : 0
    }));

    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Daily Report');

      worksheet.columns = [
        { header: 'Employee Name', key: 'employeeName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Punch In', key: 'punchInTime', width: 15 },
        { header: 'Punch Out', key: 'punchOutTime', width: 15 },
        { header: 'Total Hours', key: 'totalHours', width: 12 },
        { header: 'Break Count', key: 'breakCount', width: 12 },
        { header: 'Break Duration (min)', key: 'totalBreakDuration', width: 18 },
        { header: 'Attendance Status', key: 'attendanceStatus', width: 15 },
        { header: 'Leave Types', key: 'leaveTypes', width: 20 },
        { header: 'Overtime', key: 'overtime', width: 10 }
      ];

      report.forEach(row => {
        worksheet.addRow({
          ...row,
          leaveTypes: row.leaveTypes.join(', '),
          punchInTime: row.punchInTime ? moment(row.punchInTime).format('HH:mm:ss') : '--:--:--',
          punchOutTime: row.punchOutTime ? moment(row.punchOutTime).format('HH:mm:ss') : '--:--:--'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="daily-attendance-${targetDate}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['employeeName', 'email', 'department', 'punchInTime', 'punchOutTime', 'totalHours', 'breakCount', 'totalBreakDuration', 'attendanceStatus', 'leaveTypes', 'overtime'];
      const opts = { fields };

      const csvData = report.map(row => ({
        ...row,
        leaveTypes: row.leaveTypes.join(', '),
        punchInTime: row.punchInTime ? moment(row.punchInTime).format('HH:mm:ss') : '--:--:--',
        punchOutTime: row.punchOutTime ? moment(row.punchOutTime).format('HH:mm:ss') : '--:--:--'
      }));

      const parser = new Parser(opts);
      const csv = parser.parse(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="daily-attendance-${targetDate}.csv"`);
      res.send(csv);
    } else {
      res.json({
        report,
        date: targetDate,
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ message: 'Server error generating daily report' });
  }
};

// Admin: Get Weekly Report
const getWeeklyReport = async (req, res) => {
  try {
    const { weekStart, department, format = 'json' } = req.query;
    const startDate = weekStart ? moment(weekStart) : moment().startOf('week');
    const endDate = moment(startDate).endOf('week');

    let departmentFilter = '';
    let params = [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')];

    if (department) {
      departmentFilter = ' AND u.position LIKE ?';
      params.push(`%${department}%`);
    }

    const [reportData] = await pool.query(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.position,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN ar.status = 'half-day' THEN 1 END) as half_days,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN ar.status = 'week-off' THEN 1 END) as week_off_days,
        COUNT(CASE WHEN ar.status = 'holiday' THEN 1 END) as holiday_days,
        SUM(ar.total_hours) as total_hours,
        AVG(ar.total_hours) as avg_daily_hours,
        COUNT(DISTINCT ab.id) as total_breaks,
        SUM(ab.duration_minutes) as total_break_duration,
        GROUP_CONCAT(DISTINCT l.leave_type) as leave_types
      FROM users u
      LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date BETWEEN ? AND ?
      LEFT JOIN attendance_breaks ab ON u.id = ab.user_id AND DATE(ab.break_start_time) BETWEEN ? AND ?
      LEFT JOIN attendance_leaves l ON u.id = l.user_id AND l.start_date <= ? AND l.end_date >= ?
      WHERE u.role != 'admin' ${departmentFilter}
      GROUP BY u.id, u.fullName, u.email, u.position
      ORDER BY u.fullName
    `, [...params, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), startDate.format('YYYY-MM-DD')]);

    const report = reportData.map(row => ({
      employeeId: row.id,
      employeeName: row.fullName,
      email: row.email,
      department: row.position,
      presentDays: row.present_days || 0,
      halfDays: row.half_days || 0,
      absentDays: row.absent_days || 0,
      weekOffDays: row.week_off_days || 0,
      holidayDays: row.holiday_days || 0,
      totalHours: row.total_hours || 0,
      avgDailyHours: row.avg_daily_hours || 0,
      totalBreaks: row.total_breaks || 0,
      totalBreakDuration: row.total_break_duration || 0,
      leaveTypes: row.leave_types ? row.leave_types.split(',') : [],
      attendancePercentage: ((row.present_days + row.half_days * 0.5) / 7) * 100
    }));

    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Weekly Report');

      worksheet.columns = [
        { header: 'Employee Name', key: 'employeeName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Present Days', key: 'presentDays', width: 12 },
        { header: 'Half Days', key: 'halfDays', width: 10 },
        { header: 'Absent Days', key: 'absentDays', width: 12 },
        { header: 'Week-off Days', key: 'weekOffDays', width: 12 },
        { header: 'Holiday Days', key: 'holidayDays', width: 12 },
        { header: 'Total Hours', key: 'totalHours', width: 12 },
        { header: 'Avg Daily Hours', key: 'avgDailyHours', width: 15 },
        { header: 'Total Breaks', key: 'totalBreaks', width: 12 },
        { header: 'Break Duration (min)', key: 'totalBreakDuration', width: 18 },
        { header: 'Attendance %', key: 'attendancePercentage', width: 12 }
      ];

      report.forEach(row => {
        worksheet.addRow({
          ...row,
          attendancePercentage: Math.round(row.attendancePercentage) + '%'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-attendance-${startDate.format('YYYY-MM-DD')}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['employeeName', 'email', 'department', 'presentDays', 'halfDays', 'absentDays', 'weekOffDays', 'holidayDays', 'totalHours', 'avgDailyHours', 'totalBreaks', 'totalBreakDuration', 'attendancePercentage'];
      const opts = { fields };

      const csvData = report.map(row => ({
        ...row,
        attendancePercentage: Math.round(row.attendancePercentage) + '%'
      }));

      const parser = new Parser(opts);
      const csv = parser.parse(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-attendance-${startDate.format('YYYY-MM-DD')}.csv"`);
      res.send(csv);
    } else {
      res.json({
        report,
        period: { startDate: startDate.format('YYYY-MM-DD'), endDate: endDate.format('YYYY-MM-DD') },
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ message: 'Server error generating weekly report' });
  }
};

// Admin: Get Monthly Report
const getMonthlyReport = async (req, res) => {
  try {
    const { year, month, department, format = 'json' } = req.query;
    const targetYear = year || moment().year();
    const targetMonth = month || moment().month() + 1;
    const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month');
    const endDate = moment(`${targetYear}-${targetMonth}-01`).endOf('month');

    let departmentFilter = '';
    let params = [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')];

    if (department) {
      departmentFilter = ' AND u.position LIKE ?';
      params.push(`%${department}%`);
    }

    const [reportData] = await pool.query(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.position,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN ar.status = 'half-day' THEN 1 END) as half_days,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN ar.status = 'week-off' THEN 1 END) as week_off_days,
        COUNT(CASE WHEN ar.status = 'holiday' THEN 1 END) as holiday_days,
        SUM(ar.total_hours) as total_hours,
        AVG(ar.total_hours) as avg_daily_hours,
        COUNT(DISTINCT ab.id) as total_breaks,
        SUM(ab.duration_minutes) as total_break_duration,
        GROUP_CONCAT(DISTINCT l.leave_type) as leave_types,
        GROUP_CONCAT(DISTINCT l.status) as leave_statuses
      FROM users u
      LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date BETWEEN ? AND ?
      LEFT JOIN attendance_breaks ab ON u.id = ab.user_id AND DATE(ab.break_start_time) BETWEEN ? AND ?
      LEFT JOIN attendance_leaves l ON u.id = l.user_id AND l.start_date <= ? AND l.end_date >= ?
      WHERE u.role != 'admin' ${departmentFilter}
      GROUP BY u.id, u.fullName, u.email, u.position
      ORDER BY u.fullName
    `, [...params, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), startDate.format('YYYY-MM-DD')]);

    const report = reportData.map(row => ({
      employeeId: row.id,
      employeeName: row.fullName,
      email: row.email,
      department: row.position,
      presentDays: row.present_days || 0,
      halfDays: row.half_days || 0,
      absentDays: row.absent_days || 0,
      weekOffDays: row.week_off_days || 0,
      holidayDays: row.holiday_days || 0,
      totalHours: row.total_hours || 0,
      avgDailyHours: row.avg_daily_hours || 0,
      totalBreaks: row.total_breaks || 0,
      totalBreakDuration: row.total_break_duration || 0,
      leaveTypes: row.leave_types ? row.leave_types.split(',') : [],
      leaveStatuses: row.leave_statuses ? row.leave_statuses.split(',') : [],
      attendancePercentage: ((row.present_days + row.half_days * 0.5) / moment(`${targetYear}-${targetMonth}`).daysInMonth()) * 100,
      overtime: row.total_hours > (8 * row.present_days) ? row.total_hours - (8 * row.present_days) : 0
    }));

    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Monthly Report');

      worksheet.columns = [
        { header: 'Employee Name', key: 'employeeName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Present Days', key: 'presentDays', width: 12 },
        { header: 'Half Days', key: 'halfDays', width: 10 },
        { header: 'Absent Days', key: 'absentDays', width: 12 },
        { header: 'Week-off Days', key: 'weekOffDays', width: 12 },
        { header: 'Holiday Days', key: 'holidayDays', width: 12 },
        { header: 'Total Hours', key: 'totalHours', width: 12 },
        { header: 'Avg Daily Hours', key: 'avgDailyHours', width: 15 },
        { header: 'Total Breaks', key: 'totalBreaks', width: 12 },
        { header: 'Break Duration (min)', key: 'totalBreakDuration', width: 18 },
        { header: 'Attendance %', key: 'attendancePercentage', width: 12 },
        { header: 'Overtime', key: 'overtime', width: 10 }
      ];

      report.forEach(row => {
        worksheet.addRow({
          ...row,
          attendancePercentage: Math.round(row.attendancePercentage) + '%'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-attendance-${targetYear}-${targetMonth}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['employeeName', 'email', 'department', 'presentDays', 'halfDays', 'absentDays', 'weekOffDays', 'holidayDays', 'totalHours', 'avgDailyHours', 'totalBreaks', 'totalBreakDuration', 'attendancePercentage', 'overtime'];
      const opts = { fields };

      const csvData = report.map(row => ({
        ...row,
        attendancePercentage: Math.round(row.attendancePercentage) + '%'
      }));

      const parser = new Parser(opts);
      const csv = parser.parse(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-attendance-${targetYear}-${targetMonth}.csv"`);
      res.send(csv);
    } else {
      res.json({
        report,
        period: { year: targetYear, month: targetMonth, startDate: startDate.format('YYYY-MM-DD'), endDate: endDate.format('YYYY-MM-DD') },
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ message: 'Server error generating monthly report' });
  }
};

const getAdminMonthlyAttendance = async (req, res) => {
  try {
    const { userId, year, month } = req.query;

    if (!userId || !year || !month) {
      return res.status(400).json({ message: 'User ID, year, and month are required' });
    }

    const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');

    // Get attendance records for the month
    const [records] = await pool.query(
      'SELECT date, status, total_hours, punch_in_time, punch_out_time FROM attendance_records WHERE user_id = ? AND date BETWEEN ? AND ?',
      [userId, startDate, endDate]
    );

    // Get holidays for the month
    const [holidays] = await pool.query(
      'SELECT holiday_date, holiday_name FROM attendance_holidays WHERE holiday_date BETWEEN ? AND ?',
      [startDate, endDate]
    );

    // Get approved leaves for the month
    const [leaves] = await pool.query(
      'SELECT start_date, end_date, leave_type FROM attendance_leaves WHERE user_id = ? AND status = ? AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?))',
      [userId, 'approved', startDate, endDate, startDate, endDate, startDate, endDate]
    );

    // Create calendar data
    const calendarData = {};
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    for (let date = startMoment.clone(); date.isSameOrBefore(endMoment); date.add(1, 'days')) {
      const dateStr = date.format('YYYY-MM-DD');
      const record = records.find(r => r.date === dateStr);
      const holiday = holidays.find(h => h.holiday_date === dateStr);
      const leave = leaves.find(l => dateStr >= l.start_date && dateStr <= l.end_date);

      calendarData[dateStr] = {
        date: dateStr,
        status: record ? record.status : (holiday ? 'holiday' : (leave ? 'leave' : 'not-recorded')),
        totalHours: record ? record.total_hours : 0,
        punchInTime: record ? record.punch_in_time : null,
        punchOutTime: record ? record.punch_out_time : null,
        holidayName: holiday ? holiday.holiday_name : null,
        leaveType: leave ? leave.leave_type : null,
        dayOfWeek: date.format('dddd')
      };
    }

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      calendarData
    });
  } catch (error) {
    console.error('Error getting admin monthly attendance:', error);
    res.status(500).json({ message: 'Server error getting monthly attendance' });
  }
};

// Submit Work Log
const submitWorkLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, task, description, hours, category, priority } = req.body;

    if (!date || !task || !description || !hours) {
      return res.status(400).json({ message: 'Date, task, description, and hours are required' });
    }

    // Check if work log already exists for this date and task
    const [existing] = await pool.query(
      'SELECT id FROM work_logs WHERE user_id = ? AND date = ? AND tasks_completed = ?',
      [userId, date, task]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Work log already exists for this task on this date' });
    }

    await pool.query(
      'INSERT INTO work_logs (user_id, date, work_description, hours_worked, tasks_completed, category, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, date, description, hours, task, category || 'general', priority || 'medium']
    );

    res.json({ message: 'Work log submitted successfully' });
  } catch (error) {
    console.error('Error submitting work log:', error);
    res.status(500).json({ message: 'Server error submitting work log' });
  }
};

// Get Work Logs for current user
const getWorkLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category, priority } = req.query;

    let whereClause = 'WHERE user_id = ?';
    let params = [userId];

    if (startDate && endDate) {
      whereClause += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }

    const [workLogs] = await pool.query(
      `SELECT id, user_id, attendance_id, date, work_description, hours_worked, tasks_completed, challenges_faced, tomorrow_plan, submitted_at, updated_at FROM work_logs ${whereClause} ORDER BY date DESC, created_at DESC`,
      params
    );

    res.json(workLogs);
  } catch (error) {
    console.error('Error getting work logs:', error);
    res.status(500).json({ message: 'Server error getting work logs' });
  }
};

// Submit Daily Work Log (detailed end-of-day report)
const submitDailyWorkLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, workDescription, hoursWorked, tasksCompleted, challengesFaced, tomorrowPlan } = req.body;

    if (!date || !workDescription) {
      return res.status(400).json({ message: 'Date and work description are required' });
    }

    // Check if work log already exists for this date
    const [existing] = await pool.query(
      'SELECT id FROM work_logs WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Work log already exists for this date' });
    }

    // Get attendance record for this date to link it
    const [attendanceRecord] = await pool.query(
      'SELECT id FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    await pool.query(
      'INSERT INTO work_logs (user_id, attendance_id, date, work_description, hours_worked, tasks_completed, challenges_faced, tomorrow_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, attendanceRecord.length > 0 ? attendanceRecord[0].id : null, date, workDescription, hoursWorked || 0, tasksCompleted, challengesFaced, tomorrowPlan]
    );

    res.json({ message: 'Daily work log submitted successfully' });
  } catch (error) {
    console.error('Error submitting daily work log:', error);
    res.status(500).json({ message: 'Server error submitting daily work log' });
  }
};

// Update Work Log
const updateWorkLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { task, description, hours, category, priority } = req.body;

    // Check if work log exists and belongs to user
    const [existing] = await pool.query(
      'SELECT id FROM work_logs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Work log not found' });
    }

    await pool.query(
      'UPDATE work_logs SET task = ?, description = ?, hours = ?, category = ?, priority = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [task, description, hours, category, priority, id, userId]
    );

    res.json({ message: 'Work log updated successfully' });
  } catch (error) {
    console.error('Error updating work log:', error);
    res.status(500).json({ message: 'Server error updating work log' });
  }
};

// Admin: Get All Work Logs
const getAllWorkLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, startDate, endDate, category, priority } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (userId) {
      whereClause += ' AND wl.user_id = ?';
      params.push(userId);
    }

    if (startDate && endDate) {
      whereClause += ' AND wl.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (category) {
      whereClause += ' AND wl.category = ?';
      params.push(category);
    }

    if (priority) {
      whereClause += ' AND wl.priority = ?';
      params.push(priority);
    }

    const [workLogs] = await pool.query(`
      SELECT wl.id, wl.user_id, wl.attendance_id, wl.date, wl.work_description, wl.hours_worked, wl.tasks_completed, wl.challenges_faced, wl.tomorrow_plan, wl.submitted_at, wl.updated_at, u.fullName, u.email, u.position
      FROM work_logs wl
      JOIN users u ON wl.user_id = u.id
      WHERE 1=1 ${whereClause}
      ORDER BY wl.date DESC, wl.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [totalCount] = await pool.query(`
      SELECT COUNT(*) as count
      FROM work_logs wl
      WHERE 1=1 ${whereClause}
    `, params);

    res.json({
      workLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all work logs:', error);
    res.status(500).json({ message: 'Server error getting work logs' });
  }
};

// Admin: Get Work Logs for specific user
const getUserWorkLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, category, priority } = req.query;

    let whereClause = 'WHERE wl.user_id = ?';
    let params = [userId];

    if (startDate && endDate) {
      whereClause += ' AND wl.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (category) {
      whereClause += ' AND wl.category = ?';
      params.push(category);
    }

    if (priority) {
      whereClause += ' AND wl.priority = ?';
      params.push(priority);
    }

    const [workLogs] = await pool.query(`
      SELECT wl.id, wl.user_id, wl.attendance_id, wl.date, wl.work_description, wl.hours_worked, wl.tasks_completed, wl.challenges_faced, wl.tomorrow_plan, wl.submitted_at, wl.updated_at, u.fullName, u.email, u.position
      FROM work_logs wl
      JOIN users u ON wl.user_id = u.id
      ${whereClause}
      ORDER BY wl.date DESC, wl.created_at DESC
    `, params);

    res.json(workLogs);
  } catch (error) {
    console.error('Error getting user work logs:', error);
    res.status(500).json({ message: 'Server error getting user work logs' });
  }
};

const getLiveAttendance = async (req, res) => {
  try {
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    // Get start time setting for late calculation
    const [settings] = await pool.query(
      'SELECT setting_value FROM attendance_settings WHERE setting_key = ?',
      ['start_time']
    );
    const startTime = settings.length > 0 ? settings[0].setting_value : '09:30:00';

    // Get all employees with their current attendance status
    const [employees] = await pool.query(`
      SELECT
        u.id,
        u.fullName as name,
        u.email,
        u.position as department,
        ar.punch_in_time,
        ar.punch_out_time,
        ar.total_hours,
        ar.status as record_status,
        CASE
          WHEN ar.punch_in_time IS NOT NULL AND ar.punch_out_time IS NULL
               AND NOT EXISTS (SELECT 1 FROM attendance_breaks ab WHERE ab.attendance_id = ar.id AND ab.break_end_time IS NULL) THEN 'working'
          WHEN ar.punch_in_time IS NOT NULL AND ar.punch_out_time IS NULL
               AND EXISTS (SELECT 1 FROM attendance_breaks ab WHERE ab.attendance_id = ar.id AND ab.break_end_time IS NULL) THEN 'on_break'
          WHEN ar.punch_in_time IS NOT NULL AND ar.punch_out_time IS NOT NULL THEN 'punched_out'
          ELSE 'not_punched_in'
        END as status,
        (SELECT break_start_time FROM attendance_breaks ab WHERE ab.attendance_id = ar.id AND ab.break_end_time IS NULL LIMIT 1) as breakStartTime,

        (SELECT COUNT(*) FROM attendance_breaks bc WHERE bc.user_id = u.id AND DATE(bc.break_start_time) = ?) as breaksTaken,
        COALESCE(ar.total_hours, 0) as hoursWorked,
        ar.punch_in_time as lastActivity
      FROM users u
      LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date = ?
      WHERE u.role != 'admin' AND u.approved = 1
      ORDER BY u.fullName
    `, [today, today]);

    // Process employees to determine late status
    let lateComers = 0;
    const processedEmployees = employees.map(employee => {
      let isLate = false;
      if (employee.punch_in_time) {
        const punchInTime = moment(employee.punch_in_time).format('HH:mm');
        if (punchInTime > startTime) {
          isLate = true;
          lateComers++;
        }
      }
      return { ...employee, isLate };
    });

    // Calculate stats
    const stats = {
      totalEmployees: processedEmployees.length,
      currentlyWorking: processedEmployees.filter(e => e.status === 'working').length,
      onBreak: processedEmployees.filter(e => e.status === 'on_break').length,
      punchedOut: processedEmployees.filter(e => e.status === 'punched_out').length,
      lateComers
    };

    res.json({ employees: processedEmployees, stats });
  } catch (error) {
    console.error('Error fetching live attendance:', error);
    res.status(500).json({ message: 'Server error fetching live attendance' });
  }
};

// Get today's attendance and monthly summary combined
const getTodayAndMonthlyAttendance = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const currentMonth = moment().tz('Asia/Kolkata').format('YYYY-MM');
    const startOfMonth = moment(currentMonth + '-01').startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(currentMonth + '-01').endOf('month').format('YYYY-MM-DD');

    // Get today's attendance data
    const [todayRecords] = await pool.query(
      'SELECT id, punch_in_time, punch_out_time, total_hours, status, production_hours, break_duration FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    // Get today's breaks
    const [todayBreaks] = await pool.query(
      'SELECT id, break_start_time as break_start, break_end_time as break_end, duration_minutes, status, reason FROM attendance_breaks WHERE user_id = ? AND DATE(break_start_time) = ? ORDER BY break_start_time DESC',
      [userId, today]
    );

    // Get monthly summary
    const [monthlyRecords] = await pool.query(
      'SELECT status, COUNT(*) as count FROM attendance_records WHERE user_id = ? AND date BETWEEN ? AND ? GROUP BY status',
      [userId, startOfMonth, endOfMonth]
    );

    // Get leave balance
    const [leaveBalance] = await pool.query(`
      SELECT
        (SELECT COALESCE(SUM(allocated_days), 0) FROM attendance_leave_balances WHERE user_id = ? AND leave_type = 'annual') as annual_allocated,
        (SELECT COALESCE(SUM(used_days), 0) FROM attendance_leave_balances WHERE user_id = ? AND leave_type = 'annual') as annual_used,
        (SELECT COALESCE(SUM(allocated_days), 0) FROM attendance_leave_balances WHERE user_id = ? AND leave_type = 'sick') as sick_allocated,
        (SELECT COALESCE(SUM(used_days), 0) FROM attendance_leave_balances WHERE user_id = ? AND leave_type = 'sick') as sick_used,
        (SELECT COALESCE(SUM(allocated_days), 0) FROM attendance_leave_balances WHERE user_id = ? AND leave_type = 'casual') as casual_allocated,
        (SELECT COALESCE(SUM(used_days), 0) FROM attendance_leave_balances WHERE user_id = ? AND leave_type = 'casual') as casual_used
    `, [userId, userId, userId, userId, userId, userId]);

    // Calculate monthly summary
    const monthlySummary = {
      present: 0,
      absent: 0,
      halfDays: 0,
      weekOffs: 0,
      holidays: 0,
      totalDays: 0,
      workingDays: 0,
      attendancePercentage: 0,
      averageDailyHours: 0
    };

    // Count days in current month so far
    const daysInMonth = moment().date();
    monthlySummary.totalDays = daysInMonth;

    monthlyRecords.forEach(record => {
      monthlySummary[record.status] = record.count;
      monthlySummary.totalDays += record.count;
    });

    // Calculate working days (total days minus weekends and holidays)
    const [holidays] = await pool.query(
      'SELECT COUNT(*) as holiday_count FROM attendance_holidays WHERE holiday_date BETWEEN ? AND ?',
      [startOfMonth, endOfMonth]
    );

    const [weekendDays] = await pool.query(`
      SELECT COUNT(*) as weekend_count FROM (
        SELECT DATE_ADD(?, INTERVAL n DAY) as date
        FROM (
          SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
          SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
          SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
          SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL
          SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
          SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
        ) numbers
        WHERE DATE_ADD(?, INTERVAL n DAY) <= ?
      ) dates
      WHERE DAYOFWEEK(date) IN (1, 7) -- Sunday = 1, Saturday = 7
    `, [startOfMonth, startOfMonth, endOfMonth]);

    monthlySummary.holidays = holidays[0]?.holiday_count || 0;
    monthlySummary.weekOffs = weekendDays[0]?.weekend_count || 0;
    monthlySummary.workingDays = monthlySummary.totalDays - monthlySummary.weekOffs - monthlySummary.holidays;

    // Calculate attendance percentage
    const presentEquivalent = monthlySummary.present + (monthlySummary.halfDays * 0.5);
    monthlySummary.attendancePercentage = monthlySummary.workingDays > 0 ?
      Math.round((presentEquivalent / monthlySummary.workingDays) * 100) : 0;

    // Calculate average daily hours
    const [avgHours] = await pool.query(
      'SELECT AVG(total_hours) as avg_hours FROM attendance_records WHERE user_id = ? AND date BETWEEN ? AND ? AND status IN ("present", "half-day")',
      [userId, startOfMonth, endOfMonth]
    );
    monthlySummary.averageDailyHours = avgHours[0]?.avg_hours ? Math.round(avgHours[0].avg_hours * 100) / 100 : 0;

    // Prepare today's attendance data
    const todayAttendance = todayRecords.length > 0 ? {
      clockInTime: todayRecords[0].punch_in_time,
      clockOutTime: todayRecords[0].punch_out_time,
      totalWorkHours: todayRecords[0].total_hours || 0,
      breakDurations: todayBreaks.map(breakItem => ({
        start: breakItem.break_start,
        end: breakItem.break_end,
        duration: breakItem.duration_minutes || 0,
        reason: breakItem.break_reason
      })),
      attendanceStatus: todayRecords[0].status || 'not-recorded'
    } : {
      clockInTime: null,
      clockOutTime: null,
      totalWorkHours: 0,
      breakDurations: [],
      attendanceStatus: 'not-recorded'
    };

    // Prepare leave balance data
    const leaveBalanceData = leaveBalance[0] ? {
      annual: {
        allocated: leaveBalance[0].annual_allocated || 0,
        used: leaveBalance[0].annual_used || 0,
        remaining: (leaveBalance[0].annual_allocated || 0) - (leaveBalance[0].annual_used || 0)
      },
      sick: {
        allocated: leaveBalance[0].sick_allocated || 0,
        used: leaveBalance[0].sick_used || 0,
        remaining: (leaveBalance[0].sick_allocated || 0) - (leaveBalance[0].sick_used || 0)
      },
      casual: {
        allocated: leaveBalance[0].casual_allocated || 0,
        used: leaveBalance[0].casual_used || 0,
        remaining: (leaveBalance[0].casual_allocated || 0) - (leaveBalance[0].casual_used || 0)
      }
    } : {
      annual: { allocated: 0, used: 0, remaining: 0 },
      sick: { allocated: 0, used: 0, remaining: 0 },
      casual: { allocated: 0, used: 0, remaining: 0 }
    };

    res.json({
      todayAttendance,
      monthlySummary,
      leaveBalance: leaveBalanceData
    });
  } catch (error) {
    console.error('Error getting today and monthly attendance:', error);
    res.status(500).json({ message: 'Server error getting attendance data' });
  }
};

const submitTimesheet = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      punchInTime,
      punchOutTime,
      workedHours,
      tasks,
      totalTaskHours,
      date
    } = req.body;

    // Validate required fields
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'At least one task is required' });
    }

    // Validate tasks
    for (const task of tasks) {
      if (!task.description || !task.hours || !task.category) {
        return res.status(400).json({ message: 'All tasks must have description, hours, and category' });
      }
      if (task.hours <= 0) {
        return res.status(400).json({ message: 'Task hours must be greater than 0' });
      }
    }

    // Check if timesheet already exists for this date
    const [existingTimesheet] = await pool.query(
      'SELECT id FROM timesheets WHERE employee_id = ? AND date = ?',
      [userId, date]
    );

    if (existingTimesheet.length > 0) {
      return res.status(400).json({ message: 'Timesheet already exists for this date' });
    }

    // Insert timesheet
    const [timesheetResult] = await pool.query(
      `INSERT INTO timesheets (
        employee_id, date, punch_in_time, punch_out_time,
        worked_hours, total_task_hours, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'submitted', NOW())`,
      [userId, date, punchInTime, punchOutTime, workedHours, totalTaskHours]
    );

    const timesheetId = timesheetResult.insertId;

    // Insert tasks
    for (const task of tasks) {
      await pool.query(
        `INSERT INTO timesheet_tasks (
          timesheet_id, description, hours, category, created_at
        ) VALUES (?, ?, ?, ?, NOW())`,
        [timesheetId, task.description, task.hours, task.category]
      );
    }

    // Log the activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await pool.query(
      `INSERT INTO audit_logs (
        user_id, action, details, ip_address, user_agent, created_at
      ) VALUES (?, 'TIMESHEET_SUBMITTED', ?, ?, ?, NOW())`,
      [
        userId,
        `Timesheet submitted for ${date} with ${tasks.length} tasks`,
        ipAddress,
        userAgent
      ]
    );

    res.json({
      message: 'Timesheet submitted successfully',
      timesheetId
    });

  } catch (error) {
    console.error('Timesheet submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTimesheets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, status } = req.query;

    let whereClause = 'WHERE employee_id = ?';
    let params = [userId];

    if (startDate && endDate) {
      whereClause += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const [timesheets] = await pool.query(`
      SELECT t.*, p.name as project_name, p.client as project_client
      FROM timesheets t
      LEFT JOIN projects p ON t.project_id = p.id
      ${whereClause}
      ORDER BY t.date DESC, t.created_at DESC
    `, params);

    res.json(timesheets);
  } catch (error) {
    console.error('Error getting timesheets:', error);
    res.status(500).json({ message: 'Server error getting timesheets' });
  }
};

const updateTimesheet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { projectId, title, description, billable, hours } = req.body;

    // Check if timesheet exists and belongs to user and is not approved
    const [existing] = await pool.query(
      'SELECT id, status FROM timesheets WHERE id = ? AND employee_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    if (existing[0].status === 'approved') {
      return res.status(400).json({ message: 'Cannot update approved timesheet' });
    }

    await pool.query(
      'UPDATE timesheets SET project_id = ?, title = ?, description = ?, billable = ?, hours_worked = ?, updated_at = NOW() WHERE id = ? AND employee_id = ?',
      [projectId, title, description, billable, hours, id, userId]
    );

    res.json({ message: 'Timesheet updated successfully' });
  } catch (error) {
    console.error('Error updating timesheet:', error);
    res.status(500).json({ message: 'Server error updating timesheet' });
  }
};

const getAllTimesheets = async (req, res) => {
  try {
    const { page = 1, limit = 50, employeeId, startDate, endDate, status, projectId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (employeeId) {
      whereClause += ' AND t.employee_id = ?';
      params.push(employeeId);
    }

    if (startDate && endDate) {
      whereClause += ' AND t.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    if (projectId) {
      whereClause += ' AND t.project_id = ?';
      params.push(projectId);
    }

    const [timesheets] = await pool.query(`
      SELECT t.*, u.fullName as employee_name, u.email, u.position, p.name as project_name, p.client as project_client
      FROM timesheets t
      JOIN users u ON t.employee_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1 ${whereClause}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [totalCount] = await pool.query(`
      SELECT COUNT(*) as count
      FROM timesheets t
      WHERE 1=1 ${whereClause}
    `, params);

    res.json({
      timesheets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all timesheets:', error);
    res.status(500).json({ message: 'Server error getting timesheets' });
  }
};

const processTimesheet = async (req, res) => {
  try {
    const { id, action, remarks } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    await pool.query(
      'UPDATE timesheets SET status = ?, approved_at = NOW(), approver_id = ? WHERE id = ?',
      [status, adminId, id]
    );

    // Log audit entry
    const [timesheet] = await pool.query('SELECT employee_id, date FROM timesheets WHERE id = ?', [id]);
    if (timesheet.length > 0) {
      await pool.query(
        'INSERT INTO attendance_audit (attendance_id, timesheet_id, action_type, actor_id, reason) VALUES (?, ?, ?, ?, ?)',
        [null, id, `timesheet_${action}`, adminId, remarks]
      );
    }

    res.json({ message: `Timesheet ${status} successfully` });
  } catch (error) {
    console.error('Error processing timesheet:', error);
    res.status(500).json({ message: 'Server error processing timesheet' });
  }
};

const bulkProcessTimesheets = async (req, res) => {
  try {
    const { timesheetIds, action, remarks } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action) || !Array.isArray(timesheetIds)) {
      return res.status(400).json({ message: 'Invalid action or timesheet IDs' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    // Update all timesheets
    await pool.query(
      `UPDATE timesheets SET status = ?, approved_at = NOW(), approver_id = ? WHERE id IN (${timesheetIds.map(() => '?').join(',')})`,
      [status, adminId, ...timesheetIds]
    );

    // Log audit entries
    for (const timesheetId of timesheetIds) {
      const [timesheet] = await pool.query('SELECT employee_id, date FROM timesheets WHERE id = ?', [timesheetId]);
      if (timesheet.length > 0) {
        await pool.query(
          'INSERT INTO attendance_audit (attendance_id, timesheet_id, action_type, actor_id, reason) VALUES (?, ?, ?, ?, ?)',
          [null, timesheetId, `timesheet_${action}`, adminId, remarks]
        );
      }
    }

    res.json({ message: `${timesheetIds.length} timesheets ${status} successfully` });
  } catch (error) {
    console.error('Error bulk processing timesheets:', error);
    res.status(500).json({ message: 'Server error processing timesheets' });
  }
};

const getProjects = async (req, res) => {
  try {
    const [projects] = await pool.query(
      'SELECT * FROM projects ORDER BY name ASC'
    );

    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ message: 'Server error getting projects' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, client } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    await pool.query(
      'INSERT INTO projects (name, client) VALUES (?, ?)',
      [name, client]
    );

    res.json({ message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    await pool.query(
      'UPDATE projects SET name = ?, client = ? WHERE id = ?',
      [name, client, id]
    );

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project is being used in timesheets
    const [usage] = await pool.query(
      'SELECT COUNT(*) as count FROM timesheets WHERE project_id = ?',
      [id]
    );

    if (usage[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete project that is being used in timesheets' });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

const startBreakWithReason = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;
    const now = moment().tz('Asia/Kolkata');
    const today = now.format('YYYY-MM-DD');
    const currentTime = now.format('YYYY-MM-DD HH:mm:ss');

    // Check if user is punched in today
    const [attendanceRecord] = await pool.query(
      'SELECT id FROM attendance_records WHERE user_id = ? AND date = ? AND punch_in_time IS NOT NULL AND punch_out_time IS NULL',
      [userId, today]
    );

    if (attendanceRecord.length === 0) {
      return res.status(400).json({ message: 'You must be punched in to start a break' });
    }

    // Check if there's already an active break
    const [activeBreak] = await pool.query(
      'SELECT id FROM attendance_breaks WHERE user_id = ? AND status = ?',
      [userId, 'active']
    );

    if (activeBreak.length > 0) {
      return res.status(400).json({ message: 'You already have an active break' });
    }

    // Start new break
    await pool.query(
      'INSERT INTO attendance_breaks (user_id, attendance_record_id, break_start, status, break_reason) VALUES (?, ?, ?, ?, ?)',
      [userId, attendanceRecord[0].id, currentTime, 'active', reason]
    );

    // Emit socket event for real-time update
    socketService.emitToAll('attendanceUpdate', {
      type: 'startBreak',
      userId,
      data: {
        breakStartTime: currentTime,
        reason,
        date: today,
        status: 'active'
      }
    });

    res.json({
      message: 'Break started successfully',
      breakStartTime: currentTime,
      reason
    });
  } catch (error) {
    console.error('Error starting break:', error);
    res.status(500).json({ message: 'Server error starting break' });
  }
};

const endBreakWithNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { note } = req.body;
    const now = moment().tz('Asia/Kolkata');
    const currentTime = now.format('YYYY-MM-DD HH:mm:ss');

    // Find active break
    const [activeBreak] = await pool.query(
      'SELECT id, break_start_time FROM attendance_breaks WHERE user_id = ? AND status = ?',
      [userId, 'active']
    );

    if (activeBreak.length === 0) {
      return res.status(400).json({ message: 'No active break found' });
    }

    const breakRecord = activeBreak[0];
    const breakDuration = moment.duration(moment(currentTime).diff(moment(breakRecord.break_start_time))).asMinutes();

    // Update break record
    await pool.query(
      'UPDATE attendance_breaks SET break_end_time = ?, duration_minutes = ?, status = ?, break_note = ? WHERE id = ?',
      [currentTime, Math.round(breakDuration), 'completed', note, breakRecord.id]
    );

    // Emit socket event for real-time update
    socketService.emitToAll('attendanceUpdate', {
      type: 'endBreak',
      userId,
      data: {
        breakEndTime: currentTime,
        breakDuration: Math.round(breakDuration),
        note,
        date: moment().tz('Asia/Kolkata').format('YYYY-MM-DD'),
        status: 'completed'
      }
    });

    res.json({
      message: 'Break ended successfully',
      breakEndTime: currentTime,
      breakDuration: Math.round(breakDuration),
      note
    });
  } catch (error) {
    console.error('Error ending break:', error);
    res.status(500).json({ message: 'Server error ending break' });
  }
};

const getTodayBreaksDetailed = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    const [breaks] = await pool.query(
      'SELECT id, attendance_record_id, user_id, break_start_time as break_start, break_end_time as break_end_time, duration_minutes, status, break_reason, break_note FROM attendance_breaks WHERE user_id = ? AND DATE(break_start_time) = ? ORDER BY break_start_time DESC',
      [userId, today]
    );

    res.json(breaks);
  } catch (error) {
    console.error('Error getting today breaks:', error);
    res.status(500).json({ message: 'Server error getting breaks' });
  }
};

const overrideAttendanceWithAudit = async (req, res) => {
  try {
    const { userId, date, punchInTime, punchOutTime, status, reason } = req.body;
    const adminId = req.user.id;

    if (!userId || !date) {
      return res.status(400).json({ message: 'User ID and date are required' });
    }

    const totalHours = punchInTime && punchOutTime ? calculateTotalHours(punchInTime, punchOutTime) : 0;
    const finalStatus = status || (totalHours > 0 ? await determineAttendanceStatus(totalHours, date) : 'absent');

    // Get existing record for audit
    const [existingRecord] = await pool.query(
      'SELECT punch_in_time, punch_out_time, total_hours, status FROM attendance_records WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    // Insert or update attendance record
    await pool.query(`
      INSERT INTO attendance_records (user_id, date, punch_in_time, punch_out_time, total_hours, status, is_admin_override, override_reason, overridden_by)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      ON DUPLICATE KEY UPDATE
      punch_in_time = VALUES(punch_in_time),
      punch_out_time = VALUES(punch_out_time),
      total_hours = VALUES(total_hours),
      status = VALUES(status),
      is_admin_override = 1,
      override_reason = VALUES(override_reason),
      overridden_by = VALUES(overridden_by),
      updated_at = NOW()
    `, [userId, date, punchInTime, punchOutTime, totalHours, finalStatus, reason, adminId]);

    // Log audit entry
    const [attendanceRecord] = await pool.query('SELECT id FROM attendance_records WHERE user_id = ? AND date = ?', [userId, date]);
    if (attendanceRecord.length > 0) {
      const oldValue = existingRecord.length > 0 ? JSON.stringify(existingRecord[0]) : null;
      const newValue = JSON.stringify({ punch_in_time: punchInTime, punch_out_time: punchOutTime, total_hours: totalHours, status: finalStatus });

      await pool.query(
        'INSERT INTO attendance_audit (attendance_id, action_type, actor_id, previous_value, new_value, reason) VALUES (?, ?, ?, ?, ?, ?)',
        [attendanceRecord[0].id, 'admin_override', adminId, oldValue, newValue, reason]
      );
    }

    res.json({ message: 'Attendance record overridden successfully' });
  } catch (error) {
    console.error('Error overriding attendance record:', error);
    res.status(500).json({ message: 'Server error overriding attendance record' });
  }
};

// Leave Policy Functions

/**
 * Calculate leave balance for a user
 * @param {number} userId - User ID
 * @param {number} year - Year for which to calculate balance
 * @returns {Promise<Object>} Leave balance data
 */
const calculateLeaveBalance = async (userId, year = null) => {
  const currentYear = year || moment().year();

  const [balances] = await pool.query(`
    SELECT
      leave_type,
      SUM(allocated_days) as allocated,
      SUM(used_days) as used,
      SUM(carried_forward) as carried_forward
    FROM attendance_leave_balances
    WHERE user_id = ? AND year = ?
    GROUP BY leave_type
  `, [userId, currentYear]);

  const leaveBalance = {};
  balances.forEach(balance => {
    leaveBalance[balance.leave_type] = {
      allocated: parseFloat(balance.allocated || 0),
      used: parseFloat(balance.used || 0),
      carriedForward: parseFloat(balance.carried_forward || 0),
      remaining: parseFloat(balance.allocated || 0) + parseFloat(balance.carried_forward || 0) - parseFloat(balance.used || 0)
    };
  });

  return leaveBalance;
};

/**
 * Check if a leave request complies with leave policy
 * @param {number} userId - User ID
 * @param {string} leaveType - Type of leave
 * @param {string} startDate - Start date of leave
 * @param {string} endDate - End date of leave
 * @returns {Promise<Object>} Policy check result
 */
const checkLeavePolicy = async (userId, leaveType, startDate, endDate) => {
  try {
    // Get leave policy settings
    const [policies] = await pool.query(
      'SELECT * FROM attendance_leave_policies WHERE leave_type = ? AND is_active = 1',
      [leaveType]
    );

    if (policies.length === 0) {
      return { valid: false, message: 'Leave policy not found for this leave type' };
    }

    const policy = policies[0];

    // Calculate leave days
    const start = moment(startDate);
    const end = moment(endDate);
    const leaveDays = end.diff(start, 'days') + 1;

    // Check maximum consecutive days
    if (leaveDays > policy.max_consecutive_days) {
      return {
        valid: false,
        message: `Maximum consecutive leave days for ${leaveType} is ${policy.max_consecutive_days}`
      };
    }

    // Check notice period
    const today = moment();
    const noticeDays = start.diff(today, 'days');
    if (noticeDays < policy.notice_period_days) {
      return {
        valid: false,
        message: `Minimum notice period for ${leaveType} leave is ${policy.notice_period_days} days`
      };
    }

    // Check leave balance
    const leaveBalance = await calculateLeaveBalance(userId);
    const balance = leaveBalance[leaveType];

    if (!balance || balance.remaining < leaveDays) {
      return {
        valid: false,
        message: `Insufficient leave balance. Available: ${balance ? balance.remaining : 0} days, Requested: ${leaveDays} days`
      };
    }

    // Check for overlapping approved leaves
    const [overlapping] = await pool.query(
      'SELECT id FROM attendance_leaves WHERE user_id = ? AND status = ? AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?))',
      [userId, 'approved', startDate, endDate, startDate, endDate, startDate, endDate]
    );

    if (overlapping.length > 0) {
      return { valid: false, message: 'Leave request overlaps with existing approved leave' };
    }

    return { valid: true, leaveDays, policy };
  } catch (error) {
    console.error('Error checking leave policy:', error);
    return { valid: false, message: 'Error checking leave policy' };
  }
};

/**
 * Accrue leave for a user (monthly accrual)
 * @param {number} userId - User ID
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {Promise<void>}
 */
const accrueLeave = async (userId, year, month) => {
  try {
    // Get active leave policies
    const [policies] = await pool.query(
      'SELECT * FROM attendance_leave_policies WHERE is_active = 1 AND monthly_accrual > 0'
    );

    for (const policy of policies) {
      // Check if accrual already exists for this month
      const [existing] = await pool.query(
        'SELECT id FROM attendance_leave_accruals WHERE user_id = ? AND leave_type = ? AND year = ? AND month = ?',
        [userId, policy.leave_type, year, month]
      );

      if (existing.length > 0) continue;

      // Accrue leave
      await pool.query(
        'INSERT INTO attendance_leave_accruals (user_id, leave_type, days_accrued, accrual_date, year, month) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, policy.leave_type, policy.monthly_accrual, moment().format('YYYY-MM-DD'), year, month]
      );

      // Update leave balance
      await pool.query(`
        INSERT INTO attendance_leave_balances (user_id, leave_type, allocated_days, year)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        allocated_days = allocated_days + VALUES(allocated_days)
      `, [userId, policy.leave_type, policy.monthly_accrual, year]);
    }
  } catch (error) {
    console.error('Error accruing leave:', error);
  }
};

/**
 * Get formatted leave balance data for API response
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Formatted leave balance
 */
const getLeaveBalance = async (userId) => {
  const leaveBalance = await calculateLeaveBalance(userId);

  return {
    annual: leaveBalance.annual || { allocated: 0, used: 0, carriedForward: 0, remaining: 0 },
    sick: leaveBalance.sick || { allocated: 0, used: 0, carriedForward: 0, remaining: 0 },
    casual: leaveBalance.casual || { allocated: 0, used: 0, carriedForward: 0, remaining: 0 },
    maternity: leaveBalance.maternity || { allocated: 0, used: 0, carriedForward: 0, remaining: 0 },
    paternity: leaveBalance.paternity || { allocated: 0, used: 0, carriedForward: 0, remaining: 0 }
  };
};

/**
 * Initialize leave balances for a new employee
 * @param {number} userId - User ID
 * @param {number} year - Year to initialize
 * @returns {Promise<void>}
 */
const initializeLeaveBalances = async (userId, year = null) => {
  const currentYear = year || moment().year();

  const [policies] = await pool.query(
    'SELECT * FROM attendance_leave_policies WHERE is_active = 1'
  );

  for (const policy of policies) {
    await pool.query(`
      INSERT IGNORE INTO attendance_leave_balances (user_id, leave_type, allocated_days, year)
      VALUES (?, ?, ?, ?)
    `, [userId, policy.leave_type, policy.annual_allocation, currentYear]);
  }
};

// Admin: Get all leave policies
const getLeavePolicies = async (req, res) => {
  try {
    const [policies] = await pool.query(
      'SELECT * FROM attendance_leave_policies ORDER BY leave_type'
    );

    res.json(policies);
  } catch (error) {
    console.error('Error getting leave policies:', error);
    res.status(500).json({ message: 'Server error getting leave policies' });
  }
};

// Admin: Update leave policy
const updateLeavePolicy = async (req, res) => {
  try {
    const { leaveType } = req.params;
    const {
      annualAllocation,
      monthlyAccrual,
      maxCarryForward,
      maxConsecutiveDays,
      noticePeriodDays,
      requiresDocumentation,
      isActive
    } = req.body;

    await pool.query(`
      UPDATE attendance_leave_policies SET
        annual_allocation = ?,
        monthly_accrual = ?,
        max_carry_forward = ?,
        max_consecutive_days = ?,
        notice_period_days = ?,
        requires_documentation = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE leave_type = ?
    `, [
      annualAllocation,
      monthlyAccrual,
      maxCarryForward,
      maxConsecutiveDays,
      noticePeriodDays,
      requiresDocumentation,
      isActive,
      leaveType
    ]);

    res.json({ message: 'Leave policy updated successfully' });
  } catch (error) {
    console.error('Error updating leave policy:', error);
    res.status(500).json({ message: 'Server error updating leave policy' });
  }
};

// Admin: Bulk update leave policies
const bulkUpdateLeavePolicies = async (req, res) => {
  try {
    const policies = req.body;

    if (!Array.isArray(policies)) {
      return res.status(400).json({ message: 'Policies must be an array' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const policy of policies) {
        const {
          leave_type,
          annual_allocation,
          monthly_accrual,
          max_carry_forward,
          max_consecutive_days,
          notice_period_days,
          requires_documentation,
          is_active
        } = policy;

        if (!leave_type) {
          throw new Error('Leave type is required for each policy');
        }

        await connection.query(`
          UPDATE attendance_leave_policies SET
            annual_allocation = ?,
            monthly_accrual = ?,
            max_carry_forward = ?,
            max_consecutive_days = ?,
            notice_period_days = ?,
            requires_documentation = ?,
            is_active = ?,
            updated_at = NOW()
          WHERE leave_type = ?
        `, [
          annual_allocation,
          monthly_accrual,
          max_carry_forward,
          max_consecutive_days,
          notice_period_days,
          requires_documentation,
          is_active,
          leave_type
        ]);
      }

      await connection.commit();
      res.json({ message: 'Leave policies updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error bulk updating leave policies:', error);
    res.status(500).json({ message: 'Server error updating leave policies' });
  }
};

// Admin: Get leave balances for all employees
const getAllLeaveBalances = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || moment().year();

    const [balances] = await pool.query(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        lb.leave_type,
        lb.allocated_days,
        lb.used_days,
        lb.carried_forward,
        (lb.allocated_days + lb.carried_forward - lb.used_days) as remaining_days
      FROM users u
      LEFT JOIN attendance_leave_balances lb ON u.id = lb.user_id AND lb.year = ?
      WHERE u.role != 'admin'
      ORDER BY u.fullName, lb.leave_type
    `, [targetYear]);

    // Group by employee
    const employeeBalances = {};
    balances.forEach(balance => {
      if (!employeeBalances[balance.id]) {
        employeeBalances[balance.id] = {
          employeeId: balance.id,
          employeeName: balance.fullName,
          email: balance.email,
          leaveBalances: {}
        };
      }

      employeeBalances[balance.id].leaveBalances[balance.leave_type] = {
        allocated: parseFloat(balance.allocated_days || 0),
        used: parseFloat(balance.used_days || 0),
        carriedForward: parseFloat(balance.carried_forward || 0),
        remaining: parseFloat(balance.remaining_days || 0)
      };
    });

    res.json(Object.values(employeeBalances));
  } catch (error) {
    console.error('Error getting leave balances:', error);
    res.status(500).json({ message: 'Server error getting leave balances' });
  }
};

// Admin: Adjust employee leave balance
const adjustLeaveBalance = async (req, res) => {
  try {
    const { userId, leaveType, adjustment, reason } = req.body;
    const adminId = req.user.id;
    const year = moment().year();

    // Get current balance
    const [currentBalance] = await pool.query(
      'SELECT allocated_days, used_days, carried_forward FROM attendance_leave_balances WHERE user_id = ? AND leave_type = ? AND year = ?',
      [userId, leaveType, year]
    );

    const current = currentBalance[0] || { allocated_days: 0, used_days: 0, carried_forward: 0 };
    const newAllocated = Math.max(0, current.allocated_days + adjustment);

    // Update balance
    await pool.query(`
      INSERT INTO attendance_leave_balances (user_id, leave_type, allocated_days, year)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      allocated_days = VALUES(allocated_days)
    `, [userId, leaveType, newAllocated, year]);

    // Log the adjustment
    await pool.query(
      'INSERT INTO attendance_audit (action_type, actor_id, reason, new_value) VALUES (?, ?, ?, ?)',
      ['leave_balance_adjustment', adminId, reason, JSON.stringify({
        userId,
        leaveType,
        adjustment,
        previousAllocated: current.allocated_days,
        newAllocated
      })]
    );

    res.json({ message: 'Leave balance adjusted successfully' });
  } catch (error) {
    console.error('Error adjusting leave balance:', error);
    res.status(500).json({ message: 'Server error adjusting leave balance' });
  }
};

// Admin: Run monthly leave accrual for all employees
const runMonthlyLeaveAccrual = async (req, res) => {
  try {
    const adminId = req.user.id;
    const currentDate = moment();
    const year = currentDate.year();
    const month = currentDate.month() + 1;

    // Get all active employees
    const [employees] = await pool.query(
      'SELECT id FROM users WHERE role != ? AND approved = 1',
      ['admin']
    );

    let successCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        await accrueLeave(employee.id, year, month);
        successCount++;
      } catch (error) {
        console.error(`Error accruing leave for employee ${employee.id}:`, error);
        errorCount++;
      }
    }

    // Log the accrual run
    await pool.query(
      'INSERT INTO attendance_audit (action_type, actor_id, reason, new_value) VALUES (?, ?, ?, ?)',
      ['monthly_leave_accrual', adminId, `Monthly leave accrual for ${year}-${month}`, JSON.stringify({
        year,
        month,
        employeesProcessed: successCount,
        errors: errorCount
      })]
    );

    res.json({
      message: `Monthly leave accrual completed for ${year}-${month}`,
      successCount,
      errorCount
    });
  } catch (error) {
    console.error('Error running monthly leave accrual:', error);
    res.status(500).json({ message: 'Server error running leave accrual' });
  }
};

module.exports = {
  punchIn,
  punchOut,
  getTodayStatus,
  getWeeklyAttendance,
  getMonthlyAttendance,
  requestCorrection,
  getCorrectionRequests,
  getAllCorrectionRequests,
  processCorrection,
  addHoliday,
  getHolidays,
  getAttendanceSummary,
  getAllAttendanceRecords,
  overrideAttendanceRecord,
  getAttendanceReports,
  getAttendanceAnalytics,
  deleteHoliday,
  updateHoliday,
  startBreak,
  endBreak,
  getTodayBreaks,
  requestLeave,
  getLeaveRequests,
  getAllLeaveRequests,
  processLeaveRequest,
  autoPunchIn,
  autoPunchOut,
  sendPunchInReminder,
  sendPunchOutReminder,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getAdminMonthlyAttendance,
  submitWorkLog,
  getWorkLogs,
  updateWorkLog,
  getAllWorkLogs,
  getUserWorkLogs,
  getLiveAttendance,
  getTodayAndMonthlyAttendance,
  submitTimesheet,
  getTimesheets,
  updateTimesheet,
  getAllTimesheets,
  processTimesheet,
  bulkProcessTimesheets,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  startBreakWithReason,
  endBreakWithNote,
  getTodayBreaksDetailed,
  overrideAttendanceWithAudit,
  calculateLeaveBalance,
  checkLeavePolicy,
  accrueLeave,
  getLeaveBalance,
  initializeLeaveBalances,
  getLeavePolicies,
  updateLeavePolicy,
  getAllLeaveBalances,
  adjustLeaveBalance,
  runMonthlyLeaveAccrual
};
