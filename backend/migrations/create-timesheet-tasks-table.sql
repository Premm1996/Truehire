-- Create timesheets table if it doesn't exist
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
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    approver_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create timesheet_tasks table for storing individual tasks within timesheets
CREATE TABLE IF NOT EXISTS timesheet_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timesheet_id INT NOT NULL,
    description TEXT NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    category VARCHAR(100) DEFAULT 'Development',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_timesheet_tasks_timesheet_id (timesheet_id)
);
