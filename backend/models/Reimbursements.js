const db = require('../db');

class Reimbursements {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM reimbursements WHERE user_id = ? ORDER BY submitted_date DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT r.*, u.fullName, u.email FROM reimbursements r JOIN users u ON r.user_id = u.id ORDER BY r.submitted_date DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByStatus(status) {
    try {
      const [rows] = await db.query(
        'SELECT r.*, u.fullName, u.email FROM reimbursements r JOIN users u ON r.user_id = u.id WHERE r.status = ? ORDER BY r.submitted_date DESC',
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(reimbursementData) {
    try {
      const [result] = await db.query('INSERT INTO reimbursements SET ?', reimbursementData);
      return { id: result.insertId, ...reimbursementData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const [result] = await db.query('UPDATE reimbursements SET ? WHERE id = ?', [updateData, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM reimbursements WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async approve(id, approvedBy) {
    try {
      const [result] = await db.query(
        'UPDATE reimbursements SET status = "approved", approved_by = ?, approved_date = NOW() WHERE id = ?',
        [approvedBy, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async reject(id, approvedBy, rejectionReason) {
    try {
      const [result] = await db.query(
        'UPDATE reimbursements SET status = "rejected", approved_by = ?, approved_date = NOW(), rejection_reason = ? WHERE id = ?',
        [approvedBy, rejectionReason, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async markAsPaid(id, paymentDate) {
    try {
      const [result] = await db.query(
        'UPDATE reimbursements SET status = "paid", payment_date = ? WHERE id = ?',
        [paymentDate, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async syncToPayroll(userId, payrollMonth) {
    // Get approved reimbursements for the month
    try {
      const [rows] = await db.query(
        'SELECT SUM(amount) as total_reimbursements FROM reimbursements WHERE user_id = ? AND status = "approved" AND DATE_FORMAT(submitted_date, "%Y-%m") = ?',
        [userId, payrollMonth]
      );
      return rows[0].total_reimbursements || 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Reimbursements;
