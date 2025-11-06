const db = require('../db');

class EmployeeSalaryStructure {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM employee_salary_structure WHERE user_id = ?', [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await db.query('INSERT INTO employee_salary_structure SET ?', data);
      return { id: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const [result] = await db.query('UPDATE employee_salary_structure SET ? WHERE id = ?', [data, id]);
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
}

class PayrollHistory {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM payroll_history WHERE user_id = ?', [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await db.query('INSERT INTO payroll_history SET ?', data);
      return { id: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }
}

class ComplianceRule {
  static async getActiveRules() {
    try {
      const [rows] = await db.query('SELECT * FROM compliance_rules WHERE is_active = TRUE');
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

class TaxDeclaration {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM tax_declarations WHERE user_id = ?', [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await db.query('INSERT INTO tax_declarations SET ?', data);
      return { id: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, approvedBy, approvedAt, rejectionReason) {
    try {
      const [result] = await db.query(
        'UPDATE tax_declarations SET status = ?, approved_by = ?, approved_at = ?, rejection_reason = ? WHERE id = ?',
        [status, approvedBy, approvedAt, rejectionReason, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

class Reimbursement {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM reimbursements WHERE user_id = ?', [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await db.query('INSERT INTO reimbursements SET ?', data);
      return { id: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, approvedBy, approvedAt, paidAt, rejectionReason) {
    try {
      const [result] = await db.query(
        'UPDATE reimbursements SET status = ?, approved_by = ?, approved_at = ?, paid_at = ?, rejection_reason = ? WHERE id = ?',
        [status, approvedBy, approvedAt, paidAt, rejectionReason, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  EmployeeSalaryStructure,
  PayrollHistory,
  ComplianceRule,
  TaxDeclaration,
  Reimbursement,
};
