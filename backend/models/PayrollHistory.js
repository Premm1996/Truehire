const db = require('../db');

class PayrollHistory {
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM payroll_history WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM payroll_history WHERE user_id = ? ORDER BY payroll_month DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserAndMonth(userId, payrollMonth) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM payroll_history WHERE user_id = ? AND payroll_month = ?',
        [userId, payrollMonth]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT ph.*, u.fullName, u.email FROM payroll_history ph JOIN users u ON ph.user_id = u.id ORDER BY ph.payroll_month DESC, ph.created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByStatus(status) {
    try {
      const [rows] = await db.query(
        'SELECT ph.*, u.fullName, u.email FROM payroll_history ph JOIN users u ON ph.user_id = u.id WHERE ph.status = ? ORDER BY ph.payroll_month DESC',
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(payrollData) {
    try {
      const [result] = await db.query('INSERT INTO payroll_history SET ?', payrollData);
      return { id: result.insertId, ...payrollData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const [result] = await db.query('UPDATE payroll_history SET ? WHERE id = ?', [updateData, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM payroll_history WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async calculateSalary(userId, payrollMonth, attendanceData = null) {
    // Fetch salary structure
    const SalaryStructure = require('./SalaryStructure');
    const structure = await SalaryStructure.findByUserId(userId);
    if (!structure) throw new Error('Salary structure not found for user');

    let gross = structure.total_earnings || structure.basic_salary;
    let deductions = structure.total_deductions || structure.pf_employee;

    // Adjust for attendance if provided
    if (attendanceData) {
      const { presentDays, totalDays, lopDays, overtimeHours } = attendanceData;
      // Assuming monthly salary, adjust based on present days
      const dailyRate = structure.basic_salary / 30; // Rough estimate
      const attendanceAdjustment = (presentDays / totalDays) * structure.basic_salary - structure.basic_salary;
      gross += attendanceAdjustment;

      // Add overtime (assume 1.5x rate)
      const overtimePay = overtimeHours * (dailyRate / 8) * 1.5;
      gross += overtimePay;

      // LOP deduction
      const lopDeduction = lopDays * dailyRate;
      deductions += lopDeduction;
    }

    const net = gross - deductions;

    return {
      basic_salary: structure.basic_salary,
      hra: structure.hra,
      conveyance_allowance: structure.conveyance_allowance,
      medical_allowance: structure.medical_allowance,
      lta: structure.lta,
      other_allowances: structure.other_allowances,
      total_earnings: gross,
      pf_employee: structure.pf_employee,
      professional_tax: structure.professional_tax,
      tax_deductions: structure.tax_deductions,
      other_deductions: structure.other_deductions,
      total_deductions: deductions,
      net_salary: net,
      lop_days: attendanceData?.lopDays || 0,
      overtime_hours: attendanceData?.overtimeHours || 0
    };
  }
}

module.exports = PayrollHistory;
