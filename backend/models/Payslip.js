const db = require('../db');

class Payslip {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(`
        SELECT
          ph.id,
          ph.payroll_id,
          ph.payroll_month,
          ph.payslip_path as file_url,
          ph.created_at as generated_at,
          ph.downloaded_at
        FROM payroll_history ph
        WHERE ph.user_id = ? AND ph.payslip_generated = true
        ORDER BY ph.payroll_month DESC
      `, [userId]);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT
          ph.id,
          ph.payroll_id,
          ph.payroll_month,
          ph.payslip_path as file_url,
          ph.created_at as generated_at,
          ph.downloaded_at,
          ph.user_id,
          e.full_name as employee_name,
          e.email
        FROM payroll_history ph
        LEFT JOIN employees e ON ph.user_id = e.user_id
        WHERE ph.payslip_generated = true
        ORDER BY ph.payroll_month DESC
      `);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(payslipData) {
    try {
      const { payroll_id, file_url } = payslipData;

      const [result] = await db.execute(`
        UPDATE payroll_history
        SET payslip_path = ?, payslip_generated = true, updated_at = NOW()
        WHERE id = ?
      `, [file_url, payroll_id]);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateDownloadedAt(payslipId) {
    try {
      const [result] = await db.execute(`
        UPDATE payroll_history
        SET downloaded_at = NOW()
        WHERE id = ?
      `, [payslipId]);

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Payslip;
