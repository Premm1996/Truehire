const express = require('express');
const router = express.Router();
const pool = require('../db-fixed');
const { authenticateToken, requireAdmin, logActivity } = require('../middleware/auth');

// Get all form templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const [templates] = await pool.query(
      'SELECT ft.*, u.email as created_by_email FROM form_templates ft JOIN users u ON ft.created_by = u.id WHERE ft.is_active = TRUE ORDER BY ft.created_at DESC'
    );
    res.json(templates);
  } catch (error) {
    console.error('Error fetching form templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get form template by ID
router.get('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const [templates] = await pool.query(
      'SELECT ft.*, u.email as created_by_email FROM form_templates ft JOIN users u ON ft.created_by = u.id WHERE ft.id = ?',
      [req.params.id]
    );
    
    if (templates.length === 0) {
      return res.status(404).json({ message: 'Form template not found' });
    }
    
    res.json(templates[0]);
  } catch (error) {
    console.error('Error fetching form template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new form template (admin only)
router.post('/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, type, schema } = req.body;
    
    if (!name || !type || !schema) {
      return res.status(400).json({ message: 'Name, type, and schema are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO form_templates (name, description, type, schema, created_by) VALUES (?, ?, ?, ?, ?)',
      [name, description, type, JSON.stringify(schema), req.user.id]
    );
    
    await logActivity(req.user.id, 'create_form_template', 'form_templates', result.insertId, { name, type });
    
    res.status(201).json({
      message: 'Form template created successfully',
      templateId: result.insertId
    });
  } catch (error) {
    console.error('Error creating form template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update form template (admin only)
router.put('/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, type, schema, is_active } = req.body;
    
    const [result] = await pool.query(
      'UPDATE form_templates SET name = ?, description = ?, type = ?, schema = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, type, JSON.stringify(schema), is_active, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Form template not found' });
    }
    
    await logActivity(req.user.id, 'update_form_template', 'form_templates', req.params.id, { name, type });
    
    res.json({ message: 'Form template updated successfully' });
  } catch (error) {
    console.error('Error updating form template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete form template (admin only)
router.delete('/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE form_templates SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Form template not found' });
    }
    
    await logActivity(req.user.id, 'delete_form_template', 'form_templates', req.params.id);
    
    res.json({ message: 'Form template deleted successfully' });
  } catch (error) {
    console.error('Error deleting form template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit form
router.post('/submissions', authenticateToken, async (req, res) => {
  try {
    const { form_template_id, submission_data, attachments = [] } = req.body;
    
    if (!form_template_id || !submission_data) {
      return res.status(400).json({ message: 'Form template ID and submission data are required' });
    }
    
    // Verify form template exists
    const [templates] = await pool.query('SELECT id FROM form_templates WHERE id = ? AND is_active = TRUE', [form_template_id]);
    if (templates.length === 0) {
      return res.status(404).json({ message: 'Form template not found or inactive' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO form_submissions (form_template_id, submitted_by, submission_data, attachments) VALUES (?, ?, ?, ?)',
      [form_template_id, req.user.id, JSON.stringify(submission_data), JSON.stringify(attachments)]
    );
    
    await logActivity(req.user.id, 'submit_form', 'form_submissions', result.insertId, { form_template_id });
    
    res.status(201).json({
      message: 'Form submitted successfully',
      submissionId: result.insertId
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get form submissions (with filtering)
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const { form_template_id, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT fs.*, ft.name as form_name, u.email as submitted_by_email
      FROM form_submissions fs
      JOIN form_templates ft ON fs.form_template_id = ft.id
      JOIN users u ON fs.submitted_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (form_template_id) {
      query += ' AND fs.form_template_id = ?';
      params.push(form_template_id);
    }
    
    if (status) {
      query += ' AND fs.status = ?';
      params.push(status);
    }
    
    // Regular users can only see their own submissions
    if (!req.user.is_admin) {
      query += ' AND fs.submitted_by = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY fs.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [submissions] = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM form_submissions fs
      JOIN form_templates ft ON fs.form_template_id = ft.id
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (form_template_id) {
      countQuery += ' AND fs.form_template_id = ?';
      countParams.push(form_template_id);
    }
    
    if (status) {
      countQuery += ' AND fs.status = ?';
      countParams.push(status);
    }
    
    if (!req.user.is_admin) {
      countQuery += ' AND fs.submitted_by = ?';
      countParams.push(req.user.id);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    
    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single form submission
router.get('/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const [submissions] = await pool.query(
      `SELECT fs.*, ft.name as form_name, ft.type as form_type, u.email as submitted_by_email
       FROM form_submissions fs
       JOIN form_templates ft ON fs.form_template_id = ft.id
       JOIN users u ON fs.submitted_by = u.id
       WHERE fs.id = ?`,
      [req.params.id]
    );
    
    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Form submission not found' });
    }
    
    // Check permissions
    const submission = submissions[0];
    if (!req.user.is_admin && submission.submitted_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching form submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update form submission status (admin only)
router.put('/submissions/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, review_notes } = req.body;
    
    if (!['draft', 'submitted', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const [result] = await pool.query(
      'UPDATE form_submissions SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_notes = ? WHERE id = ?',
      [status, req.user.id, review_notes, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Form submission not found' });
    }
    
    await logActivity(req.user.id, 'update_form_status', 'form_submissions', req.params.id, { status });
    
    res.json({ message: 'Form submission status updated successfully' });
  } catch (error) {
    console.error('Error updating form submission status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
