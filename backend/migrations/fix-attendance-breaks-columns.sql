ALTER TABLE attendance_breaks CHANGE COLUMN attendance_id attendance_record_id INT NOT NULL;
ALTER TABLE attendance_breaks CHANGE COLUMN break_start break_start_time DATETIME NOT NULL;
ALTER TABLE attendance_breaks CHANGE COLUMN break_end break_end_time DATETIME;
ALTER TABLE attendance_breaks ADD COLUMN break_reason TEXT AFTER status;
ALTER TABLE attendance_breaks ADD COLUMN break_note TEXT AFTER break_reason;
