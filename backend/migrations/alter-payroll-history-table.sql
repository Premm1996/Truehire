-- Alter payroll_history table to add fields for attendance-based calculations and auto-generation
ALTER TABLE payroll_history
ADD COLUMN lop_days DECIMAL(5,2) DEFAULT 0 AFTER net_salary,
ADD COLUMN overtime_hours DECIMAL(5,2) DEFAULT 0 AFTER lop_days,
ADD COLUMN attendance_source VARCHAR(255) NULL AFTER overtime_hours,
ADD COLUMN auto_generated BOOLEAN DEFAULT FALSE AFTER attendance_source,
ADD COLUMN bulk_upload_id INT NULL AFTER auto_generated,
ADD COLUMN payslip_generated BOOLEAN DEFAULT FALSE AFTER bulk_upload_id,
ADD COLUMN payslip_path VARCHAR(255) NULL AFTER payslip_generated,
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE AFTER payslip_path,
ADD COLUMN sms_sent BOOLEAN DEFAULT FALSE AFTER email_sent,
ADD INDEX idx_lop_days (lop_days),
ADD INDEX idx_auto_generated (auto_generated),
ADD INDEX idx_payslip_generated (payslip_generated);
