-- Fix role column to include 'candidate' in ENUM to prevent data truncation
-- This ensures all valid roles are supported: candidate, employee, admin
ALTER TABLE users MODIFY COLUMN role ENUM('candidate', 'employee', 'admin') DEFAULT 'employee';
