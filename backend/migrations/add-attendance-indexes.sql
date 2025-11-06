-- Add indexes for better query performance on attendance tables
CREATE INDEX idx_ab_user_status ON attendance_breaks (user_id, status);
CREATE INDEX idx_ar_date ON attendance_records (date);
