const { pool } = require('../db');

class NotificationController {
  // Get all notifications for a user
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let query;
      let params = [];

      if (userRole === 'admin') {
        // Admins see all notifications
        query = `
          SELECT n.*, u.fullName as created_by_name
          FROM notifications n
          LEFT JOIN users u ON n.created_by = u.email
          ORDER BY n.created_at DESC
        `;
      } else {
        // Employees see notifications targeted to them or all users
        query = `
          SELECT n.*, u.fullName as created_by_name
          FROM notifications n
          LEFT JOIN users u ON n.created_by = u.email
          WHERE n.target_type = 'all'
             OR (n.target_type = 'employee' AND n.target_id = ?)
             OR (n.target_type = 'department' AND n.target_id = (
               SELECT department FROM users WHERE id = ?
             ))
          ORDER BY n.created_at DESC
        `;
        params = [userId, userId];
      }

      const [notifications] = await pool.query(query, params);

      // Get read status for current user
      const notificationIds = notifications.map(n => n.id);
      let readStatus = {};

      if (notificationIds.length > 0) {
        const [readRecords] = await pool.query(
          'SELECT notification_id FROM notification_reads WHERE user_id = ? AND notification_id IN (?)',
          [userId, notificationIds]
        );
        readStatus = readRecords.reduce((acc, record) => {
          acc[record.notification_id] = true;
          return acc;
        }, {});
      }

      // Add read status to notifications
      const notificationsWithStatus = notifications.map(notification => ({
        ...notification,
        is_read: readStatus[notification.id] || false
      }));

      res.json({
        success: true,
        notifications: notificationsWithStatus
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  // Create a new notification
  async createNotification(req, res) {
    try {
      const { title, message, type, target_type, target_id, priority, expires_at } = req.body;
      const createdBy = req.user.email;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      const [result] = await pool.query(
        `INSERT INTO notifications (title, message, type, target_type, target_id, priority, expires_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, message, type || 'info', target_type || 'all', target_id || null, priority || 'medium', expires_at || null, createdBy]
      );

      const [newNotification] = await pool.query(
        'SELECT * FROM notifications WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        notification: newNotification[0]
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error.message
      });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      // Check if notification exists
      const [notifications] = await pool.query(
        'SELECT id FROM notifications WHERE id = ?',
        [notificationId]
      );

      if (notifications.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      // Check if already read
      const [existingRead] = await pool.query(
        'SELECT id FROM notification_reads WHERE notification_id = ? AND user_id = ?',
        [notificationId, userId]
      );

      if (existingRead.length > 0) {
        return res.json({
          success: true,
          message: 'Notification already marked as read'
        });
      }

      // Mark as read
      await pool.query(
        'INSERT INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
        [notificationId, userId]
      );

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      // Get unread notifications for user
      const [unreadNotifications] = await pool.query(`
        SELECT n.id
        FROM notifications n
        WHERE n.id NOT IN (
          SELECT notification_id FROM notification_reads WHERE user_id = ?
        )
        AND (
          n.target_type = 'all'
          OR (n.target_type = 'employee' AND n.target_id = ?)
          OR (n.target_type = 'department' AND n.target_id = (
            SELECT department FROM users WHERE id = ?
          ))
        )
      `, [userId, userId, userId]);

      if (unreadNotifications.length === 0) {
        return res.json({
          success: true,
          message: 'No unread notifications found'
        });
      }

      // Mark all as read
      const notificationIds = unreadNotifications.map(n => n.id);
      const values = notificationIds.map(id => `(${id}, ${userId})`).join(',');

      await pool.query(
        `INSERT INTO notification_reads (notification_id, user_id) VALUES ${values}`
      );

      res.json({
        success: true,
        message: `${notificationIds.length} notifications marked as read`
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  // Delete a notification (admin only)
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;

      const [result] = await pool.query(
        'DELETE FROM notifications WHERE id = ?',
        [notificationId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }

  // Get notification statistics
  async getStats(req, res) {
    try {
      const [stats] = await pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN is_read = 0 THEN 1 END) as unread,
          COUNT(CASE WHEN type = 'info' THEN 1 END) as info_count,
          COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_count,
          COUNT(CASE WHEN type = 'error' THEN 1 END) as error_count,
          COUNT(CASE WHEN type = 'success' THEN 1 END) as success_count
        FROM notifications
      `);

      res.json({
        success: true,
        stats: stats[0]
      });
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification statistics',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
