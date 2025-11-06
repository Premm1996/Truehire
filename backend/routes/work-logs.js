const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db');

// Apply authentication to all routes
router.use(authenticateToken);

// Get work logs for current user
router.get('/', async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { page = 1, limit = 10, date } = req.query;

    let query = 'SELECT * FROM work_logs WHERE user_id = ?';
    let params = [employeeId];

    if (date) {
      query += ' AND DATE(date) = ?';
      params.push(date);
    }

    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [workLogs] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM work_logs WHERE user_id = ?';
    let countParams = [employeeId];

    if (date) {
      countQuery += ' AND DATE(date) = ?';
      countParams.push(date);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      workLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching work logs:', error);
    res.status(500).json({ error: 'Failed to fetch work logs' });
  }
});

// Create new work log
router.post('/', async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { date, start_time, end_time, task_description, hours_worked, status = 'draft' } = req.body;

    // Validate required fields
    if (!date || !start_time || !end_time || !task_description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate hours worked if not provided
    let calculatedHours = hours_worked;
    if (!calculatedHours) {
      const start = new Date(`${date} ${start_time}`);
      const end = new Date(`${date} ${end_time}`);
      calculatedHours = (end - start) / (1000 * 60 * 60); // Convert to hours
    }

    const [result] = await pool.query(
      'INSERT INTO work_logs (user_id, date, start_time, end_time, task_description, hours_worked, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [employeeId, date, start_time, end_time, task_description, calculatedHours, status]
    );

    res.status(201).json({
      message: 'Work log created successfully',
      workLogId: result.insertId
    });
  } catch (error) {
    console.error('Error creating work log:', error);
    res.status(500).json({ error: 'Failed to create work log' });
  }
});

// Update work log
router.put('/:id', async (req, res) => {
  try {
    const employeeId = req.user.id;
    const workLogId = req.params.id;
    const { date, start_time, end_time, task_description, hours_worked, status } = req.body;

    // Check if work log belongs to user
    const [existing] = await pool.query(
      'SELECT id FROM work_logs WHERE id = ? AND user_id = ?',
      [workLogId, employeeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Work log not found' });
    }

    // Calculate hours worked if not provided
    let calculatedHours = hours_worked;
    if (!calculatedHours && start_time && end_time) {
      const start = new Date(`${date} ${start_time}`);
      const end = new Date(`${date} ${end_time}`);
      calculatedHours = (end - start) / (1000 * 60 * 60);
    }

    await pool.query(
      'UPDATE work_logs SET date = ?, start_time = ?, end_time = ?, task_description = ?, hours_worked = ?, status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [date, start_time, end_time, task_description, calculatedHours, status, workLogId, employeeId]
    );

    res.json({ message: 'Work log updated successfully' });
  } catch (error) {
    console.error('Error updating work log:', error);
    res.status(500).json({ error: 'Failed to update work log' });
  }
});

// Delete work log
router.delete('/:id', async (req, res) => {
  try {
    const employeeId = req.user.id;
    const workLogId = req.params.id;

    // Check if work log belongs to user
    const [existing] = await pool.query(
      'SELECT id FROM work_logs WHERE id = ? AND user_id = ?',
      [workLogId, employeeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Work log not found' });
    }

    await pool.query(
      'DELETE FROM work_logs WHERE id = ? AND user_id = ?',
      [workLogId, employeeId]
    );

    res.json({ message: 'Work log deleted successfully' });
  } catch (error) {
    console.error('Error deleting work log:', error);
    res.status(500).json({ error: 'Failed to delete work log' });
  }
});

// Get work log statistics
router.get('/stats', async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { period = 'month' } = req.query; // week, month, year

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
    } else if (period === 'month') {
      dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
    } else if (period === 'year') {
      dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    }

    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total_logs,
        SUM(hours_worked) as total_hours,
        AVG(hours_worked) as avg_hours_per_log,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_logs,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_logs
      FROM work_logs
      WHERE user_id = ? ${dateFilter}
    `, [employeeId]);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching work log stats:', error);
    res.status(500).json({ error: 'Failed to fetch work log statistics' });
  }
});

module.exports = router;
