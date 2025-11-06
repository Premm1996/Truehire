const db = require('../db');

class Employee {
  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(query) {
    try {
      const [rows] = await db.query('SELECT * FROM employees WHERE ?', [query]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(employeeData) {
    try {
      const [result] = await db.query('INSERT INTO employees SET ?', employeeData);
      return { id: result.insertId, ...employeeData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const [result] = await db.query('UPDATE employees SET ? WHERE id = ?', [updateData, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM employees WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Employee;
