const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

// Basic candidate dashboard routes
router.get('/', authenticateToken, requireRole(['candidate', 'employee']), (req, res) => {
  res.json({ message: 'Candidate dashboard endpoint - to be implemented' });
});

router.get('/profile', authenticateToken, requireRole(['candidate', 'employee']), (req, res) => {
  res.json({
    user: req.user,
    profile: req.user.profile || {}
  });
});

router.put('/profile', authenticateToken, requireRole(['candidate', 'employee']), (req, res) => {
  res.json({ message: 'Profile update endpoint - to be implemented' });
});

module.exports = router;
