-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'system') DEFAULT 'info',
    target_type ENUM('all', 'employee', 'admin', 'department') DEFAULT 'all',
    target_id VARCHAR(255) NULL, -- employee_id, department_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    read_by TEXT, -- JSON array of user IDs who read it
    created_by VARCHAR(255), -- admin or system user who created it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL, -- optional expiration date
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    INDEX idx_type (type),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- Create notification_reads table for tracking who read what
CREATE TABLE IF NOT EXISTS notification_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_notification_user (notification_id, user_id)
);

-- Insert some sample notifications
INSERT INTO notifications (title, message, type, target_type, priority, created_by) VALUES
('Welcome to HireConnect', 'Welcome to the HireConnect Portal! Please complete your profile setup.', 'info', 'all', 'medium', 'system'),
('System Maintenance', 'Scheduled maintenance will occur tonight from 2 AM to 4 AM.', 'warning', 'all', 'high', 'admin'),
('Profile Update Required', 'Please update your profile information to continue using the system.', 'warning', 'all', 'medium', 'system');
