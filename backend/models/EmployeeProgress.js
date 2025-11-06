const db = require('../db');

class EmployeeProgress {
  static async saveProgress(userId, progressData) {
    const query = `
      INSERT INTO employee_progress (user_id, form_data, current_step, completed_steps, last_updated)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      form_data = VALUES(form_data),
      current_step = VALUES(current_step),
      completed_steps = VALUES(completed_steps),
      last_updated = NOW()
    `;

    const values = [
      userId,
      JSON.stringify(progressData.formData || {}),
      progressData.currentStep || 1,
      JSON.stringify(progressData.completedSteps || [])
    ];

    return db.execute(query, values);
  }

  static async getProgress(userId) {
    const query = `
      SELECT form_data, current_step, completed_steps, last_updated
      FROM employee_progress
      WHERE user_id = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    if (rows.length === 0) return null;

    return {
      formData: JSON.parse(rows[0].form_data || '{}'),
      currentStep: rows[0].current_step || 1,
      completedSteps: JSON.parse(rows[0].completed_steps || '[]'),
      lastUpdated: rows[0].last_updated
    };
  }

  static async deleteProgress(userId) {
    const query = 'DELETE FROM employee_progress WHERE user_id = ?';
    return db.execute(query, [userId]);
  }

  static async updateStep(userId, step, formData = {}) {
    const existing = await this.getProgress(userId);
    const completedSteps = existing?.completedSteps || [];

    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }

    return this.saveProgress(userId, {
      formData: { ...existing?.formData, ...formData },
      currentStep: step,
      completedSteps
    });
  }

  static async findOne(query) {
    try {
      const [rows] = await db.query('SELECT * FROM employee_progress WHERE ?', [query]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmployeeProgress;
