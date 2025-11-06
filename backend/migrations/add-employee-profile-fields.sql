-- Migration to add new fields to employee_profiles table for enhanced registration
-- Run this after the main database initialization

USE hireconnect_portal;

-- Add new columns to employee_profiles table
ALTER TABLE employee_profiles
ADD COLUMN department VARCHAR(255) DEFAULT NULL AFTER position,
ADD COLUMN joiningDate DATE DEFAULT NULL AFTER department,
ADD COLUMN employmentType ENUM('Full-time', 'Contract', 'Part-time', 'Intern') DEFAULT 'Full-time' AFTER joiningDate,
ADD COLUMN workMode ENUM('Remote', 'Hybrid', 'On-site') DEFAULT 'Hybrid' AFTER employmentType,
ADD COLUMN skills JSON DEFAULT NULL AFTER workMode,
ADD COLUMN languages JSON DEFAULT NULL AFTER skills,
ADD COLUMN personalEmail VARCHAR(255) DEFAULT NULL AFTER languages,
ADD COLUMN bio TEXT DEFAULT NULL AFTER personalEmail;

-- Update existing records to have default values
UPDATE employee_profiles SET
  employmentType = 'Full-time',
  workMode = 'Hybrid'
WHERE employmentType IS NULL OR workMode IS NULL;

-- Verify the changes
DESCRIBE employee_profiles;

SELECT '✅ Employee profile fields migration completed successfully!' AS status_message;
