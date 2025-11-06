const db = require('../db');

class SalaryStructure {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM salary_structures WHERE user_id = ? ORDER BY effective_from DESC LIMIT 1',
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT ss.*, u.fullName, u.email FROM salary_structures ss JOIN users u ON ss.user_id = u.id ORDER BY ss.effective_from DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(structureData) {
    try {
      const [result] = await db.query('INSERT INTO salary_structures SET ?', structureData);
      return { id: result.insertId, ...structureData };
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, updateData) {
    try {
      const [result] = await db.query('UPDATE salary_structures SET ? WHERE user_id = ?', [updateData, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(userId) {
    try {
      const [result] = await db.query('DELETE FROM salary_structures WHERE user_id = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getHistory(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM salary_structures WHERE user_id = ? ORDER BY effective_from DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SalaryStructure;
