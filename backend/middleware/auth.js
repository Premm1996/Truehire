const jwt = require('jsonwebtoken');
const db = require('../db');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, role, is_admin FROM users WHERE id = ?',
        [decoded.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid token format'
      });
    }

    return res.status(403).json({
      error: 'Authentication failed',
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Log user activity
const logActivity = async (userId, action, entityType = null, entityId = null, details = {}) => {
  try {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [userId, action, entityType, entityId, JSON.stringify(details)],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Audit log for admin actions
const auditLog = async (userId, adminId, action, details = {}, ipAddress = null, userAgent = null, entityType = 'user') => {
  try {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO audit_logs (user_id, admin_id, action, entity_type, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [userId, adminId, action, entityType, JSON.stringify(details), ipAddress, userAgent],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

// Re-authentication middleware for sensitive admin actions
const requireReAuth = (req, res, next) => {
  // For now, just check if admin - in production, would require password re-entry
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin re-authentication required' });
  }
  next();
};

// Log login attempts
const logLoginAttempt = async (userId, success, ipAddress, userAgent, failureReason = null) => {
  try {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO login_logs (user_id, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?)',
        [userId, ipAddress, userAgent, success, failureReason],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );

      if (success) {
        db.run('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
      }
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};



module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  logActivity,
  logLoginAttempt,
  auditLog,
  requireReAuth
};
