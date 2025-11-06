-- Alter attendance_breaks table to rename columns for consistency
ALTER TABLE attendance_breaks CHANGE COLUMN break_start break_start_time DATETIME NOT NULL;
ALTER TABLE attendance_breaks CHANGE COLUMN reason break_reason TEXT;
