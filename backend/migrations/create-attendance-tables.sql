-- Create projects table for timesheet projects
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Create attendance_breaks table
CREATE TABLE IF NOT EXISTS attendance_breaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_id INT NOT NULL,
    user_id INT NOT NULL,
    break_start_time DATETIME NOT NULL,
    break_end_time DATETIME,
    duration_minutes INT DEFAULT 0,
    status ENUM('active', 'completed') DEFAULT 'active',
    break_reason TEXT,
    break_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attendance_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create attendance_leaves table
CREATE TABLE IF NOT EXISTS attendance_leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('annual', 'sick', 'casual', 'maternity', 'paternity') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejected_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create attendance_holidays table
CREATE TABLE IF NOT EXISTS attendance_holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('national', 'regional', 'company') DEFAULT 'national',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

-- Create attendance_corrections table
CREATE TABLE IF NOT EXISTS attendance_corrections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    requested_punch_in DATETIME,
    requested_punch_out DATETIME,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INT,
    processed_at TIMESTAMP NULL,
    admin_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create attendance_work_logs table
CREATE TABLE IF NOT EXISTS attendance_work_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    task_description TEXT,
    hours DECIMAL(5,2) DEFAULT 0,
    project_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Create timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    punch_in_at DATETIME,
    punch_out_at DATETIME,
    hours_worked DECIMAL(5,2) DEFAULT 0,
    project_id INT,
    title VARCHAR(255),
    description TEXT,
    billable BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'submitted', 'approved', 'rejected', 'needs_revision') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    approver_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (approver_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create attendance_audit table
CREATE TABLE IF NOT EXISTS attendance_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_id INT,
    timesheet_id INT,
    action_type VARCHAR(100) NOT NULL,
    actor_id INT NOT NULL,
    previous_value JSON,
    new_value JSON,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attendance_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Insert some sample projects
INSERT IGNORE INTO projects (name, client) VALUES
('Project Alpha', 'Client A'),
('Project Beta', 'Client B'),
('Internal Tasks', 'Company'),
('Support', 'Various Clients');

-- Insert some sample holidays
INSERT IGNORE INTO attendance_holidays (`date`, name, type) VALUES
('2024-01-01', 'New Year\'s Day', 'national'),
('2024-12-25', 'Christmas Day', 'national'),
('2024-08-15', 'Independence Day', 'national');

-- Initialize leave balances for existing employees
INSERT IGNORE INTO attendance_leave_balances (user_id, leave_type, allocated_days, year)
SELECT u.id, 'annual', 12.00, YEAR(CURDATE()) FROM users u
UNION ALL
SELECT u.id, 'sick', 6.00, YEAR(CURDATE()) FROM users u
UNION ALL
SELECT u.id, 'casual', 6.00, YEAR(CURDATE()) FROM users u
UNION ALL
SELECT u.id, 'maternity', 84.00, YEAR(CURDATE()) FROM users u WHERE u.gender = 'female'
UNION ALL
SELECT u.id, 'paternity', 5.00, YEAR(CURDATE()) FROM users u WHERE u.gender = 'male';
