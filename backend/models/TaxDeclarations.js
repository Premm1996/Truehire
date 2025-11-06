const db = require('../db');

class TaxDeclarations {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM tax_declarations WHERE user_id = ? ORDER BY financial_year DESC, created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserAndYear(userId, financialYear) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM tax_declarations WHERE user_id = ? AND financial_year = ? ORDER BY created_at DESC',
        [userId, financialYear]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT td.*, u.fullName, u.email FROM tax_declarations td JOIN users u ON td.user_id = u.id ORDER BY td.created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByStatus(status) {
    try {
      const [rows] = await db.query(
        'SELECT td.*, u.fullName, u.email FROM tax_declarations td JOIN users u ON td.user_id = u.id WHERE td.status = ? ORDER BY td.created_at DESC',
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(declarationData) {
    try {
      const [result] = await db.query('INSERT INTO tax_declarations SET ?', declarationData);
      return { id: result.insertId, ...declarationData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const [result] = await db.query('UPDATE tax_declarations SET ? WHERE id = ?', [updateData, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM tax_declarations WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async approve(id, approvedBy) {
    try {
      const [result] = await db.query(
        'UPDATE tax_declarations SET status = "approved", approved_by = ?, approved_at = NOW() WHERE id = ?',
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
        'UPDATE tax_declarations SET status = "rejected", approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE id = ?',
        [approvedBy, rejectionReason, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TaxDeclarations;
