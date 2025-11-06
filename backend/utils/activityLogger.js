const pool = require('../db-fixed');

/**
 * Logs a user activity to the activities table.
 * @param {Object} params
 * @param {number} params.user_id - User ID (required)
 * @param {number} [params.candidate_id] - Candidate ID (optional)
 * @param {string} params.action - Action performed (required)
 * @param {string} [params.description] - Description (optional)
 * @param {string} [params.ip_address] - IP address (optional)
 * @param {string} [params.user_agent] - User agent (optional)
 */
async function logActivity({
  user_id,
  candidate_id = null,
  action,
  description = '',
  ip_address = '',
  user_agent = ''
}) {
  if (!user_id || !action) return;

  try {
    await pool.query(
      `INSERT INTO activities (user_id, candidate_id, action, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, candidate_id, action, description, ip_address, user_agent]
    );
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

module.exports = { logActivity };
