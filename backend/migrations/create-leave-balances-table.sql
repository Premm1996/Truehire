-- Create leave balances table for tracking employee leave entitlements
CREATE TABLE IF NOT EXISTS attendance_leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('annual', 'sick', 'casual', 'maternity', 'paternity') NOT NULL,
    allocated_days DECIMAL(5,2) DEFAULT 0,
    used_days DECIMAL(5,2) DEFAULT 0,
    carried_forward DECIMAL(5,2) DEFAULT 0,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_leave_year (user_id, leave_type, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create leave policy settings table
CREATE TABLE IF NOT EXISTS attendance_leave_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_type ENUM('annual', 'sick', 'casual', 'maternity', 'paternity') NOT NULL,
    annual_allocation DECIMAL(5,2) DEFAULT 0,
    monthly_accrual DECIMAL(5,2) DEFAULT 0,
    max_carry_forward DECIMAL(5,2) DEFAULT 0,
    max_consecutive_days INT DEFAULT 0,
    notice_period_days INT DEFAULT 0,
    requires_documentation BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_leave_type (leave_type)
);

-- Insert default leave policies
INSERT IGNORE INTO attendance_leave_policies (leave_type, annual_allocation, monthly_accrual, max_carry_forward, max_consecutive_days, notice_period_days, requires_documentation) VALUES
('annual', 12.00, 1.00, 5.00, 30, 7, FALSE),
('sick', 6.00, 0.50, 2.00, 5, 0, TRUE),
('casual', 6.00, 0.50, 0.00, 3, 1, FALSE),
('maternity', 84.00, 0.00, 0.00, 84, 30, TRUE),
('paternity', 5.00, 0.00, 0.00, 5, 7, FALSE);

-- Create leave accrual log table
CREATE TABLE IF NOT EXISTS attendance_leave_accruals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('annual', 'sick', 'casual', 'maternity', 'paternity') NOT NULL,
    days_accrued DECIMAL(5,2) NOT NULL,
    accrual_date DATE NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_leave_month (user_id, leave_type, year, month)
);
