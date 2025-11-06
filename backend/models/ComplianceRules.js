const db = require('../db');

class ComplianceRules {
  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT * FROM compliance_rules WHERE is_active = TRUE ORDER BY state, rule_type, effective_from DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByStateAndType(state, ruleType) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM compliance_rules WHERE state = ? AND rule_type = ? AND is_active = TRUE ORDER BY effective_from DESC LIMIT 1',
        [state, ruleType]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByType(ruleType) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM compliance_rules WHERE rule_type = ? AND is_active = TRUE ORDER BY state, effective_from DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(ruleData) {
    try {
      const [result] = await db.query('INSERT INTO compliance_rules SET ?', ruleData);
      return { id: result.insertId, ...ruleData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const [result] = await db.query('UPDATE compliance_rules SET ? WHERE id = ?', [updateData, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM compliance_rules WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deactivateOldRules(state, ruleType, newEffectiveFrom) {
    try {
      const [result] = await db.query(
        'UPDATE compliance_rules SET is_active = FALSE, effective_to = DATE_SUB(?, INTERVAL 1 DAY) WHERE state = ? AND rule_type = ? AND is_active = TRUE AND effective_from < ?',
        [newEffectiveFrom, state, ruleType, newEffectiveFrom]
      );
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ComplianceRules;
