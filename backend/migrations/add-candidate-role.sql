ALTER TABLE users MODIFY COLUMN role ENUM('employee', 'admin', 'candidate') DEFAULT 'employee';
