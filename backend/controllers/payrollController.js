const PayrollHistory = require('../models/PayrollHistory');
const SalaryStructure = require('../models/SalaryStructure');
const Reimbursements = require('../models/Reimbursements');
const AttendanceController = require('./attendanceController'); // Assuming exists

exports.getPayrollHistory = async (req, res) => {
  try {
    const payrolls = await PayrollHistory.findAll();
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await PayrollHistory.findById(id);
    if (payroll) {
      res.json(payroll);
    } else {
      res.status(404).json({ error: 'Payroll not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayrollByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const payrolls = await PayrollHistory.findByUserId(userId);
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPayroll = async (req, res) => {
  try {
    const payrollData = req.body;
    const payroll = await PayrollHistory.create(payrollData);
    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const success = await PayrollHistory.update(id, updateData);
    if (success) {
      res.json({ message: 'Payroll updated successfully' });
    } else {
      res.status(404).json({ error: 'Payroll not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await PayrollHistory.delete(id);
    if (success) {
      res.json({ message: 'Payroll deleted successfully' });
    } else {
      res.status(404).json({ error: 'Payroll not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateAutoPayroll = async (req, res) => {
  try {
    const { userId, payrollMonth } = req.body;

    // Check if payroll already exists
    const existing = await PayrollHistory.findByUserAndMonth(userId, payrollMonth);
    if (existing) {
      return res.status(400).json({ error: 'Payroll already exists for this month' });
    }

    // Fetch attendance data (assuming attendanceController has a method)
    const attendanceData = await AttendanceController.getAttendanceSummary(userId, payrollMonth);

    // Calculate salary
    const calculatedSalary = await PayrollHistory.calculateSalary(userId, payrollMonth, attendanceData);

    // Add reimbursements
    const reimbursements = await Reimbursements.syncToPayroll(userId, payrollMonth);
    calculatedSalary.total_earnings += reimbursements;
    calculatedSalary.other_allowances = (calculatedSalary.other_allowances || 0) + reimbursements;

    // Create payroll record
    const payrollData = {
      user_id: userId,
      payroll_month: payrollMonth,
      ...calculatedSalary,
      status: 'pending',
      created_by: req.user?.id || 1,
      attendance_source: 'auto',
      auto_generated: true
    };

    const payroll = await PayrollHistory.create(payrollData);
    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manualPayrollEntry = async (req, res) => {
  try {
    const { user_id, payroll_month, lop_days, overtime_hours, notes, auto_generated, ...salaryData } = req.body;

    // Format payroll_month to full date (first day of month) if it's in YYYY-MM format
    let formattedPayrollMonth = payroll_month;
    if (payroll_month && payroll_month.length === 7 && payroll_month.match(/^\d{4}-\d{2}$/)) {
      formattedPayrollMonth = `${payroll_month}-01`;
    }

    const existing = await PayrollHistory.findByUserAndMonth(user_id, payroll_month);
    if (existing) {
      return res.status(400).json({ error: 'Payroll already exists for this month' });
    }

    // Transform frontend keys to match database column names
    const transformedSalaryData = {
      basic_salary: salaryData.basic || 0,
      hra: salaryData.hra || 0,
      conveyance_allowance: salaryData.conveyance || 0,
      medical_allowance: salaryData.medical || 0,
      lta: salaryData.lta || 0,
      other_allowances: (salaryData.special_allowance || 0) + (salaryData.other_allowances || 0),
      total_earnings: salaryData.total_earnings || 0,
      pf_employee: salaryData.provident_fund || 0,
      professional_tax: salaryData.professional_tax || 0,
      tax_deductions: salaryData.income_tax || 0,
      other_deductions: salaryData.other_deductions || 0,
      total_deductions: salaryData.total_deductions || 0,
      net_salary: salaryData.net_salary || 0
    };

    const payrollData = {
      user_id: user_id,
      payroll_month: formattedPayrollMonth,
      ...transformedSalaryData,
      lop_days: lop_days || 0,
      overtime_hours: overtime_hours || 0,
      status: 'pending',
      created_by: req.user?.id || null, // Use null instead of 1 to avoid FK constraint
      auto_generated: auto_generated || false,
      remarks: notes || ''
    };

    const payroll = await PayrollHistory.create(payrollData);
    res.status(201).json(payroll);
  } catch (error) {
    console.error('Error in manualPayrollEntry:', error);
    res.status(500).json({ error: 'Failed to create manual payroll entry' });
  }
};

exports.bulkUploadPayroll = async (req, res) => {
  // Placeholder for CSV upload logic
  res.json({ message: 'Bulk upload not implemented yet' });
};

exports.exportPayrollReport = async (req, res) => {
  try {
    const payrolls = await PayrollHistory.findAll();
    // In real implementation, generate PDF/Excel
    res.json({ data: payrolls, message: 'Export data ready' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportPayrolls = async (req, res) => {
  try {
    const { format = 'xlsx', status = 'all', month = 'all', department = 'all', branch = 'all' } = req.query;

    // Build where conditions
    let whereConditions = [];
    let params = [];

    if (status !== 'all') {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (month !== 'all') {
      whereConditions.push('payroll_month = ?');
      params.push(month);
    }

    if (department !== 'all') {
      whereConditions.push('department = ?');
      params.push(department);
    }

    if (branch !== 'all') {
      whereConditions.push('branch = ?');
      params.push(branch);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get payroll data with employee names
    const query = `
      SELECT
        ph.*,
        u.fullName as employee_name
      FROM payroll_history ph
      LEFT JOIN users u ON ph.user_id = u.id
      ${whereClause}
      ORDER BY ph.payroll_month DESC, ph.created_at DESC
    `;

    const payrolls = await new Promise((resolve, reject) => {
      PayrollHistory.pool.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Employee ID', 'Employee Name', 'Department', 'Branch', 'Payroll Month',
        'Basic Salary', 'Total Earnings', 'Total Deductions', 'Net Salary',
        'Payment Status', 'LOP Days', 'Overtime Hours', 'Payment Date'
      ];

      const csvRows = payrolls.map(record => [
        record.user_id,
        record.employee_name || `Employee ${record.user_id}`,
        record.department || '',
        record.branch || '',
        record.payroll_month,
        record.basic_salary || 0,
        record.total_earnings || 0,
        record.total_deductions || 0,
        record.net_salary || 0,
        record.status,
        record.lop_days || 0,
        record.overtime_hours || 0,
        record.payment_date || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payrolls_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);

    } else {
      // Generate Excel (XLSX)
      const XLSX = require('xlsx');

      const worksheetData = [
        [
          'Employee ID', 'Employee Name', 'Department', 'Branch', 'Payroll Month',
          'Basic Salary', 'Total Earnings', 'Total Deductions', 'Net Salary',
          'Payment Status', 'LOP Days', 'Overtime Hours', 'Payment Date'
        ],
        ...payrolls.map(record => [
          record.user_id,
          record.employee_name || `Employee ${record.user_id}`,
          record.department || '',
          record.branch || '',
          record.payroll_month,
          record.basic_salary || 0,
          record.total_earnings || 0,
          record.total_deductions || 0,
          record.net_salary || 0,
          record.status,
          record.lop_days || 0,
          record.overtime_hours || 0,
          record.payment_date || ''
        ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payrolls');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 8 }, { wch: 12 }, { wch: 12 }
      ];

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=payrolls_${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(buffer);
    }
  } catch (error) {
    console.error('Error exporting payrolls:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { range = '6months' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
        break;
      case '2years':
        startDate = new Date(now.getFullYear() - 2, now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    const startDateStr = startDate.toISOString().split('T')[0];

    // Get total employees
    const [employeeResult] = await PayrollHistory.pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role IN ("employee", "candidate") AND approved = 1'
    );
    const totalEmployees = employeeResult[0].count;

    // Get active payrolls (unpaid in current month)
    const currentMonth = now.toISOString().slice(0, 7);
    const [activePayrollResult] = await PayrollHistory.pool.query(
      'SELECT COUNT(*) as count FROM payroll_history WHERE payroll_month = ? AND status != "paid"',
      [currentMonth]
    );
    const activePayrolls = activePayrollResult[0].count;

    // Get total payouts in the period
    const [payoutResult] = await PayrollHistory.pool.query(
      'SELECT SUM(total_earnings) as total FROM payroll_history WHERE payroll_month >= ? AND status = "paid"',
      [startDateStr.slice(0, 7)]
    );
    const totalPayouts = payoutResult[0].total || 0;

    // Get pending reimbursements
    const [pendingReimbResult] = await PayrollHistory.pool.query(
      'SELECT COUNT(*) as count FROM reimbursements WHERE status = "pending"'
    );
    const pendingReimbursements = pendingReimbResult[0].count;

    // Get salary distribution
    const [salaryDistResult] = await PayrollHistory.pool.query(`
      SELECT
        CASE
          WHEN total_earnings < 30000 THEN 'Under ₹30K'
          WHEN total_earnings BETWEEN 30000 AND 50000 THEN '₹30K - ₹50K'
          WHEN total_earnings BETWEEN 50000 AND 80000 THEN '₹50K - ₹80K'
          WHEN total_earnings BETWEEN 80000 AND 120000 THEN '₹80K - ₹1.2L'
          ELSE 'Above ₹1.2L'
        END as range,
        COUNT(*) as count
      FROM payroll_history
      WHERE payroll_month >= ?
      GROUP BY range
      ORDER BY MIN(total_earnings)
    `, [startDateStr.slice(0, 7)]);

    // Get payroll status distribution
    const [payrollStatusResult] = await PayrollHistory.pool.query(`
      SELECT status, COUNT(*) as count
      FROM payroll_history
      WHERE payroll_month >= ?
      GROUP BY status
    `, [startDateStr.slice(0, 7)]);

    // Get monthly trends
    const [monthlyTrendsResult] = await PayrollHistory.pool.query(`
      SELECT
        DATE_FORMAT(payroll_month, '%Y-%m') as month,
        SUM(total_earnings) as amount,
        COUNT(DISTINCT user_id) as employees
      FROM payroll_history
      WHERE payroll_month >= ?
      GROUP BY DATE_FORMAT(payroll_month, '%Y-%m')
      ORDER BY month
    `, [startDateStr.slice(0, 7)]);

    const analytics = {
      totalEmployees,
      activePayrolls,
      totalPayouts,
      pendingReimbursements,
      salaryDistribution: salaryDistResult,
      payrollStatus: payrollStatusResult,
      monthlyTrends: monthlyTrendsResult.map(trend => ({
        month: trend.month,
        amount: parseFloat(trend.amount) || 0,
        employees: trend.employees
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
};
