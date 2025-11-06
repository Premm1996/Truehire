-- Migration to add enhanced profile fields to employee_profiles table
-- Run this after ensuring the database is initialized with init-db-fixed.sql

USE hireconnect_portal;

-- Add missing fields to employee_profiles table
-- Employee ID (unique identifier)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS employeeId VARCHAR(50) DEFAULT NULL AFTER photo,
ADD UNIQUE KEY unique_employeeId (employeeId);

-- Current Status
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS status ENUM('Active', 'On Leave', 'In Notice Period') DEFAULT 'Active' AFTER department;

-- Personal Email (separate from work email)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS personalEmail VARCHAR(255) DEFAULT NULL AFTER mobile;

-- Reporting Manager (foreign key to users)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS managerId INT DEFAULT NULL AFTER joiningDate,
ADD FOREIGN KEY (managerId) REFERENCES users(id) ON DELETE SET NULL;

-- Employment Type
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS employmentType ENUM('Full-time', 'Contract', 'Part-time', 'Intern') DEFAULT 'Full-time' AFTER employmentType;

-- Work Mode
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS workMode ENUM('Remote', 'Hybrid', 'On-site') DEFAULT 'Hybrid' AFTER workMode;

-- Skills (JSON array for multi-select)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS skills JSON DEFAULT NULL AFTER skills;

-- Current Projects (JSON array)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS currentProjects JSON DEFAULT NULL AFTER currentProjects;

-- Past Projects (JSON array with links)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS pastProjects JSON DEFAULT NULL AFTER pastProjects;

-- Certifications (expand to JSON array)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS certifications JSON DEFAULT NULL AFTER certification,
DROP COLUMN IF EXISTS certification;

-- Languages (JSON for programming + spoken)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS languages JSON DEFAULT NULL AFTER languages;

-- Current Goals / OKRs (JSON)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS goals JSON DEFAULT NULL AFTER goals;

-- Last Performance Rating
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS performanceRating FLOAT DEFAULT NULL AFTER performanceRating;

-- Feedback / Notes from Manager
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT NULL AFTER feedback;

-- Achievements & Awards
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS achievements TEXT DEFAULT NULL AFTER achievements;

-- Career Progression (JSON timeline)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS careerProgression JSON DEFAULT NULL AFTER careerProgression;

-- Short Bio
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL AFTER bio;

-- Social Links (JSON, including linkedin)
ALTER TABLE employee_profiles 
ADD COLUMN IF NOT EXISTS socialLinks JSON DEFAULT NULL AFTER linkedin,
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255) DEFAULT NULL AFTER linkedin;  -- Keep for backward compat

-- Emergency Contact (expand to JSON if needed, but already exists as VARCHAR; change to JSON for full details)
ALTER TABLE employee_profiles 
MODIFY COLUMN emergencyContact JSON DEFAULT NULL;

-- Add indexes for new fields
ALTER TABLE employee_profiles 
ADD INDEX idx_profiles_status (status),
ADD INDEX idx_profiles_managerId (managerId),
ADD INDEX idx_profiles_employeeId (employeeId),
ADD INDEX idx_profiles_joiningDate (joiningDate);

-- Update sample data if exists
UPDATE employee_profiles 
SET 
    employeeId = CONCAT('EMP', id),
    status = 'Active',
    employmentType = 'Full-time',
    workMode = 'Hybrid',
    skills = '["JavaScript", "React", "Node.js"]',
    certifications = '["Certified React Developer"]',
    languages = '["English", "Hindi", "JavaScript", "Python"]',
    socialLinks = '{"linkedin": "https://linkedin.com/in/john", "github": "https://github.com/john"}'
WHERE user_id = (SELECT id FROM users WHERE email = 'john@example.com');

-- Verification
SELECT 'Migration completed successfully!' AS status;
SHOW COLUMNS FROM employee_profiles LIKE 'status';
SHOW COLUMNS FROM employee_profiles LIKE 'skills';
SHOW COLUMNS FROM employee_profiles LIKE 'socialLinks';
