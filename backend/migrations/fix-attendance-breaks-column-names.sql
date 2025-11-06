-- Fix column name inconsistencies in attendance_breaks table
-- This migration ensures column names match what the controller code expects

-- Add break_note column if it doesn't exist
ALTER TABLE attendance_breaks ADD COLUMN break_note TEXT AFTER break_reason;

-- Check if the rename was successful
DESCRIBE attendance_breaks;
