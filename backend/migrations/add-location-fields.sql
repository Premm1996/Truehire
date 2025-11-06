-- Add location fields to attendance_records table
ALTER TABLE attendance_records
ADD COLUMN start_location_lat DECIMAL(10, 8) NULL,
ADD COLUMN start_location_lng DECIMAL(11, 8) NULL,
ADD COLUMN end_location_lat DECIMAL(10, 8) NULL,
ADD COLUMN end_location_lng DECIMAL(11, 8) NULL,
ADD COLUMN start_location_address VARCHAR(255) NULL,
ADD COLUMN end_location_address VARCHAR(255) NULL;

-- Add indexes for location queries
CREATE INDEX idx_attendance_start_location ON attendance_records(start_location_lat, start_location_lng);
CREATE INDEX idx_attendance_end_location ON attendance_records(end_location_lat, end_location_lng);
