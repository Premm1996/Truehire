CREATE TABLE IF NOT EXISTS timesheet_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timesheet_id INT NOT NULL,
    description TEXT NOT NULL,
    hours FLOAT NOT NULL,
    category VARCHAR(100) DEFAULT 'Development',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timesheet_tasks_timesheet_id (timesheet_id)
);
