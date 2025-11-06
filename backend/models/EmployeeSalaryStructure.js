const db = require('../db');

class EmployeeSalaryStructure {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM employee_salary_structure WHERE user_id = ? AND is_active = TRUE ORDER BY effective_from DESC',
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
        'SELECT ess.*, u.fullName, u.email FROM employee_salary_structure ess JOIN users u ON ess.user_id = u.id WHERE ess.is_active = TRUE ORDER BY u.fullName, ess.effective_from DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM employee_salary_structure WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(salaryData) {
    try {
      const [result] = await db.query('INSERT INTO employee_salary_structure SET ?', salaryData);
      return { id: result.insertId, ...salaryData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const [result] = await db.query('UPDATE employee_salary_structure SET ? WHERE id = ?', [updateData, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM employee_salary_structure WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deactivateOldStructures(userId, newEffectiveFrom) {
    try {
      const [result] = await db.query(
        'UPDATE employee_salary_structure SET is_active = FALSE, effective_to = DATE_SUB(?, INTERVAL 1 DAY) WHERE user_id = ? AND is_active = TRUE AND effective_from < ?',
        [newEffectiveFrom, userId, newEffectiveFrom]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getActiveStructure(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM employee_salary_structure WHERE user_id = ? AND is_active = TRUE ORDER BY effective_from DESC LIMIT 1',
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmployeeSalaryStructure;
