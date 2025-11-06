const cron = require('node-cron');
const { pool } = require('../db');
const moment = require('moment-timezone');
const notificationService = require('./notificationService');
const PayrollHistory = require('../models/PayrollHistory');
const Reimbursements = require('../models/Reimbursements');
const AttendanceController = require('../controllers/attendanceController');

class CronService {
  constructor() {
    this.jobs = [];
  }

  // Auto punch out at 6:30 PM IST
  scheduleAutoPunchOut() {
    // '30 18 * * 1-5' - 6:30 PM, Monday to Friday
    const job = cron.schedule('30 18 * * 1-5', async () => {
      console.log('🔄 Running auto punch out job at 6:30 PM IST');

      try {
        const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

        // Find employees who are punched in but not punched out
        const [records] = await pool.query(`
          SELECT ar.id, ar.user_id, ar.punch_in_time, u.fullName, u.email
          FROM attendance_records ar
          JOIN users u ON ar.user_id = u.id
          WHERE ar.date = ? AND ar.punch_in_time IS NOT NULL AND ar.punch_out_time IS NULL
        `, [today]);

        console.log(`Found ${records.length} employees to auto punch out`);

        for (const record of records) {
          const punchOutTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

          // Calculate total hours
          const punchInTime = moment(record.punch_in_time);
          const punchOutMoment = moment(punchOutTime);
          const totalHours = punchOutMoment.diff(punchInTime, 'hours', true);

          // Update the record
          await pool.query(`
            UPDATE attendance_records
            SET punch_out_time = ?, total_hours = ?, is_auto_closed = TRUE
            WHERE id = ?
          `, [punchOutTime, totalHours, record.id]);

          console.log(`Auto punched out employee ${record.fullName} (ID: ${record.user_id})`);

          // Send notification
          await notificationService.sendAutoPunchOutNotification(record.email, record.fullName);
        }

      } catch (error) {
        console.error('Error in auto punch out job:', error);
      }
    }, {
      timezone: 'Asia/Kolkata'
    });

    this.jobs.push({ name: 'autoPunchOut', job });
    console.log('✅ Auto punch out job scheduled for 6:30 PM IST (Mon-Fri)');
  }

  // Send reminders at 9:15 AM IST for employees who haven't punched in
  schedulePunchInReminders() {
    // '15 9 * * 1-5' - 9:15 AM, Monday to Friday
    const job = cron.schedule('15 9 * * 1-5', async () => {
      console.log('🔄 Running punch in reminder job at 9:15 AM IST');

      try {
        const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

        // Find employees who haven't punched in today and are active
        const [employees] = await pool.query(`
          SELECT u.id, u.fullName, u.email
          FROM users u
          LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ar.date = ?
          WHERE u.role IN ('employee', 'admin') AND (ar.id IS NULL OR ar.punch_in_time IS NULL)
        `, [today]);

        console.log(`Sending reminders to ${employees.length} employees`);

        for (const employee of employees) {
          await notificationService.sendPunchInReminder(employee.email, employee.fullName);
          console.log(`Reminder sent to ${employee.fullName} (${employee.email})`);
        }

      } catch (error) {
        console.error('Error in punch in reminder job:', error);
      }
    }, {
      timezone: 'Asia/Kolkata'
    });

    this.jobs.push({ name: 'punchInReminders', job });
    console.log('✅ Punch in reminder job scheduled for 9:15 AM IST (Mon-Fri)');
  }

  // Check for excessive breaks (more than 2 hours total per day)
  scheduleBreakMonitoring() {
    // '0 */2 * * 1-5' - Every 2 hours, Monday to Friday
    const job = cron.schedule('0 */2 * * 1-5', async () => {
      console.log('🔄 Running break monitoring job');

      try {
        const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

        // Find employees with excessive break time today
        const [excessiveBreaks] = await pool.query(`
          SELECT u.id, u.fullName, u.email, SUM(ab.duration_minutes) as total_break_minutes
          FROM attendance_breaks ab
          JOIN attendance_records ar ON ab.attendance_id = ar.id
          JOIN users u ON ar.user_id = u.id
          WHERE ar.date = ? AND ab.status = 'completed'
          GROUP BY u.id, u.fullName, u.email
          HAVING total_break_minutes > 120
        `, [today]);

        for (const employee of excessiveBreaks) {
          await notificationService.sendExcessiveBreakWarning(
            employee.email,
            employee.fullName,
            Math.round(employee.total_break_minutes / 60 * 10) / 10
          );
          console.log(`Excessive break warning sent to ${employee.fullName}`);
        }

      } catch (error) {
        console.error('Error in break monitoring job:', error);
      }
    }, {
      timezone: 'Asia/Kolkata'
    });

    this.jobs.push({ name: 'breakMonitoring', job });
    console.log('✅ Break monitoring job scheduled (every 2 hours Mon-Fri)');
  }

  // Auto payroll generation on 1st of every month at 9:00 AM IST
  scheduleAutoPayroll() {
    // '0 9 1 * *' - 9:00 AM on 1st of every month
    const job = cron.schedule('0 9 1 * *', async () => {
      console.log('🔄 Running auto payroll generation job');

      try {
        const lastMonth = moment().tz('Asia/Kolkata').subtract(1, 'month');
        const payrollMonth = lastMonth.format('YYYY-MM');

        // Get all active employees
        const [employees] = await pool.query(`
          SELECT u.id, u.fullName, u.email
          FROM users u
          WHERE u.role IN ('employee', 'admin') AND u.approved = 1
        `);

        console.log(`Generating payroll for ${employees.length} employees for ${payrollMonth}`);

        for (const employee of employees) {
          try {
            // Check if payroll already exists
            const existing = await PayrollHistory.findByUserAndMonth(employee.id, payrollMonth);
            if (existing) {
              console.log(`Payroll already exists for ${employee.fullName} (${payrollMonth})`);
              continue;
            }

            // Get attendance summary (assuming method exists)
            const attendanceData = await AttendanceController.getAttendanceSummary(employee.id, payrollMonth);

            // Calculate salary
            const calculatedSalary = await PayrollHistory.calculateSalary(employee.id, payrollMonth, attendanceData);

            // Add reimbursements
            const reimbursements = await Reimbursements.syncToPayroll(employee.id, payrollMonth);
            calculatedSalary.total_earnings += reimbursements;
            calculatedSalary.other_allowances = (calculatedSalary.other_allowances || 0) + reimbursements;

            // Create payroll record
            const payrollData = {
              user_id: employee.id,
              payroll_month: payrollMonth,
              ...calculatedSalary,
              payment_status: 'pending',
              created_by: 1, // System user
              attendance_source: 'auto',
              auto_generated: true
            };

            await PayrollHistory.create(payrollData);
            console.log(`Auto-generated payroll for ${employee.fullName} (${payrollMonth})`);

          } catch (error) {
            console.error(`Error generating payroll for ${employee.fullName}:`, error);
          }
        }

      } catch (error) {
        console.error('Error in auto payroll generation job:', error);
      }
    }, {
      timezone: 'Asia/Kolkata'
    });

    this.jobs.push({ name: 'autoPayroll', job });
    console.log('✅ Auto payroll generation job scheduled for 1st of every month at 9:00 AM IST');
  }

  // Start all cron jobs
  startAllJobs() {
    console.log('🚀 Starting all cron jobs...');
    this.scheduleAutoPunchOut();
    this.schedulePunchInReminders();
    this.scheduleBreakMonitoring();
    this.scheduleAutoPayroll();
    console.log('✅ All cron jobs started successfully');
  }

  // Stop all cron jobs
  stopAllJobs() {
    console.log('🛑 Stopping all cron jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs = [];
  }

  // Get status of all jobs
  getJobStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running,
      scheduled: job.scheduled
    }));
  }
}

module.exports = new CronService();
