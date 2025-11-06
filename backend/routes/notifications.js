const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', notificationController.getNotifications);

// Create a new notification (admin only)
router.post('/', requireAdmin, notificationController.createNotification);

// Mark a notification as read
router.post('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.post('/mark-all-read', notificationController.markAllAsRead);

// Delete a notification (admin only)
router.delete('/:notificationId', requireAdmin, notificationController.deleteNotification);

// Get notification statistics (admin only)
router.get('/stats/overview', requireAdmin, notificationController.getStats);

module.exports = router;
