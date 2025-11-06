  -- ================================================================
-- COMPLETE UPDATED MYSQL SCRIPT FOR HIRECONNECT PORTAL
-- UPDATED WITH MISSING TABLES AND SCHEMA CHANGES
-- ================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hireconnect_portal;

-- Note: Using root user for database operations
-- If you need a separate user, create it manually with proper privileges

-- Use the database
USE hireconnect_portal;

-- Production configuration
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ================================================================
-- DROP EXISTING TABLES (in dependency-safe order)
-- ================================================================

-- Suppress warnings for non-existent tables
SET sql_notes = 0;

-- Drop all tables in dependency-safe order (child tables first, then parent tables)
-- Tables with foreign keys must be dropped before their referenced tables

-- Child tables with foreign keys (drop first)
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS account_logs;
DROP TABLE IF EXISTS onboarding_answers;
DROP TABLE IF EXISTS employee_progress;
DROP TABLE IF EXISTS attendance_breaks;
DROP TABLE IF EXISTS attendance_leaves;
DROP TABLE IF EXISTS notification_logs;

DROP TABLE IF EXISTS support_requests;

-- Finance hub child tables
DROP TABLE IF EXISTS payroll_history;
DROP TABLE IF EXISTS tax_declarations;
DROP TABLE IF EXISTS reimbursements;
DROP TABLE IF EXISTS form16_history;
DROP TABLE IF EXISTS employee_salary_structure;

-- Attendance system tables
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS attendance_holidays;
DROP TABLE IF EXISTS attendance_corrections;
DROP TABLE IF EXISTS attendance_settings;
DROP TABLE IF EXISTS work_logs;

-- Onboarding and progress tables
DROP TABLE IF EXISTS onboarding_status;



-- Employee tables
DROP TABLE IF EXISTS employees;

-- Audit and monitoring tables
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS admin_setup;
DROP TABLE IF EXISTS system_monitoring;

-- Job postings
DROP TABLE IF EXISTS job_postings;

-- Compliance rules (no foreign keys)
DROP TABLE IF EXISTS compliance_rules;

-- Profile and user tables (drop last as they are referenced by many)
DROP TABLE IF EXISTS employee_profiles;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS notification_reads;
DROP TABLE IF EXISTS users;

-- Re-enable warnings
SET sql_notes = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- CORE TABLES
-- ================================================================

-- Users table: Only employee and admin roles
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    plain_password VARCHAR(255),
    mobile VARCHAR(20) NOT NULL DEFAULT '',
    phone VARCHAR(20) DEFAULT NULL,
    position VARCHAR(255) DEFAULT NULL,
    department VARCHAR(255) DEFAULT NULL,
    termsAgreed BOOLEAN DEFAULT TRUE,
    role ENUM('employee', 'admin') DEFAULT 'employee',
    is_admin BOOLEAN DEFAULT FALSE,
    companyName VARCHAR(255) DEFAULT NULL,
    profile JSON DEFAULT NULL,
    isVerified BOOLEAN DEFAULT TRUE,
    verificationToken VARCHAR(255) DEFAULT NULL,
    resetPasswordToken VARCHAR(255) DEFAULT NULL,
    resetPasswordExpire DATETIME DEFAULT NULL,
    lastLogin DATETIME DEFAULT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    onboarding_step INT DEFAULT 0,
    onboarding_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE') DEFAULT 'NOT_STARTED',
    approved BOOLEAN DEFAULT 1, -- 1 for candidates (auto-approved), 0 for employees (need admin approval)

    last_step_completed_at DATETIME DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_onboarding_status (onboarding_status),
    INDEX idx_users_onboarding_step (onboarding_step),
    INDEX idx_users_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee profiles table (for employee role)
CREATE TABLE IF NOT EXISTS employee_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    fullName VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(20),
    password VARCHAR(255),
    dob DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    photo VARCHAR(255),
    idProof VARCHAR(255),
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    college VARCHAR(255),
    graduationYear VARCHAR(10),
    cgpa VARCHAR(10),
    resume VARCHAR(255),
    position VARCHAR(255),
    experience VARCHAR(255),
    expectedSalary VARCHAR(255),
    location VARCHAR(255),
    noticePeriod VARCHAR(255),
    interviewStatus VARCHAR(50),
    interviewRound VARCHAR(50),
    interviewDate DATETIME,
    interviewMode VARCHAR(50),
    interviewFeedback TEXT,
    interviewScore VARCHAR(10),
    joiningDate DATE,
    additionalDocs VARCHAR(255),
    emergencyContact JSON,
    linkedin VARCHAR(255),
    certification VARCHAR(255),
    agree BOOLEAN DEFAULT FALSE,
    selectionStatus VARCHAR(20),
    documentsUploaded BOOLEAN DEFAULT FALSE,

    department VARCHAR(255),
    employmentType VARCHAR(50),
    workMode VARCHAR(50),
    skills JSON,
    languages JSON,
    personalEmail VARCHAR(255),
    bio TEXT,
    employeeId VARCHAR(50),
    status VARCHAR(50),
    managerId INT,
    currentProjects JSON,
    pastProjects JSON,
    certifications JSON,
    goals JSON,
    performanceRating FLOAT DEFAULT NULL,
    feedback TEXT,
    achievements TEXT,
    careerProgression JSON,
    socialLinks JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (managerId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employees table for backend compatibility (used for interview, admin, etc)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    position VARCHAR(255),
    experience VARCHAR(255),
    skills TEXT,
    education TEXT,
    status ENUM('pending', 'reviewing', 'interviewed', 'selected', 'rejected', 'passed', 'failed') DEFAULT 'pending',
    agree BOOLEAN DEFAULT FALSE,
    notes TEXT,
    meet_link VARCHAR(500),
    meet_date DATE,
    meet_time VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employees_email (email),
    INDEX idx_employees_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Onboarding status tracking (simplified - only registration step)
CREATE TABLE IF NOT EXISTS onboarding_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    current_step ENUM(
        'NOT_STARTED',
        'COMPLETED'
    ) DEFAULT 'NOT_STARTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_onboarding_user_id (user_id),
    INDEX idx_onboarding_step (current_step)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Onboarding answers table to store step responses
CREATE TABLE IF NOT EXISTS onboarding_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    step INT NOT NULL,
    data JSON NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_onboarding_answers_user_step (user_id, step),
    INDEX idx_onboarding_answers_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit logs table for security and tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values JSON,
    new_values JSON,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_admin (admin_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SUPPORTING TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    document_type ENUM('resume', 'certification', 'other', 'passport_photo', 'education_certificate', 'relieving_letter') NOT NULL,
    status ENUM('NOT_UPLOADED', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED') DEFAULT 'NOT_UPLOADED',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    approved_by INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_documents_user_id (user_id),
    INDEX idx_documents_employee_id (employee_id),
    INDEX idx_documents_type (document_type),
    INDEX idx_documents_status (status),
    INDEX idx_documents_user_status (user_id, document_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_activities_user_id (user_id),
    INDEX idx_activities_employee_id (employee_id),
    INDEX idx_activities_action (action),
    INDEX idx_activities_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_postings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    employment_type ENUM('full_time', 'part_time', 'contract', 'internship') DEFAULT 'full_time',
    experience_level VARCHAR(50),
    skills_required TEXT,
    posted_by INT NOT NULL,
    status ENUM('active', 'inactive', 'filled') DEFAULT 'active',
    application_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_job_posted_by (posted_by),
    INDEX idx_job_status (status),
    INDEX idx_job_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    email VARCHAR(255),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255),
    INDEX idx_login_user_id (user_id),
    INDEX idx_login_email (email),
    INDEX idx_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type ENUM('login', 'logout', 'password_change', 'profile_update', 'account_created', 'account_updated', 'account_deleted') NOT NULL,
    action_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_account_user_id (user_id),
    INDEX idx_account_action (action_type),
    INDEX idx_account_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- ATTENDANCE SYSTEM TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    punch_in_time DATETIME,
    punch_out_time DATETIME,
    total_hours DECIMAL(5,2) DEFAULT 0,
    production_hours DECIMAL(5,2) DEFAULT 0,
    break_duration DECIMAL(5,2) DEFAULT 0,
    status ENUM('pending', 'present', 'half-day', 'absent', 'week-off', 'holiday') DEFAULT 'pending',
    is_auto_closed BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_attendance_user_id (user_id),
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance breaks table for break management
CREATE TABLE IF NOT EXISTS attendance_breaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_record_id INT NOT NULL,
    user_id INT NOT NULL,
    break_start_time DATETIME NOT NULL,
    break_end_time DATETIME,
    duration_minutes INT DEFAULT 0,
    break_reason TEXT,
    break_note TEXT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    approved BOOLEAN DEFAULT TRUE,
    approved_by INT,
    approved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_breaks_attendance_id (attendance_record_id),
    INDEX idx_breaks_user_id (user_id),
    INDEX idx_breaks_status (status),
    INDEX idx_breaks_date (break_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave requests table for leave management
CREATE TABLE IF NOT EXISTS attendance_leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('full_day', 'half_day', 'sick', 'casual', 'emergency') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(3,1) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_remarks TEXT,
    reviewed_by INT,
    reviewed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_leave_user_id (user_id),
    INDEX idx_leave_status (status),
    INDEX idx_leave_dates (start_date, end_date),
    INDEX idx_leave_type (leave_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave balances table for tracking employee leave balances
CREATE TABLE IF NOT EXISTS attendance_leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('sick', 'casual', 'annual', 'maternity', 'paternity') NOT NULL,
    total_leaves DECIMAL(5,1) NOT NULL DEFAULT 0,
    used_leaves DECIMAL(5,1) NOT NULL DEFAULT 0,
    pending_leaves DECIMAL(5,1) NOT NULL DEFAULT 0,
    remaining_leaves DECIMAL(5,1) NOT NULL DEFAULT 0,
    carry_forward DECIMAL(5,1) DEFAULT 0,
    financial_year VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_leave_type_year (user_id, leave_type, financial_year),
    INDEX idx_leave_balances_user_id (user_id),
    INDEX idx_leave_balances_type (leave_type),
    INDEX idx_leave_balances_year (financial_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave policies table for organization-wide leave policies
CREATE TABLE IF NOT EXISTS attendance_leave_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_type ENUM('sick', 'casual', 'annual', 'maternity', 'paternity') NOT NULL,
    max_leaves_per_year DECIMAL(5,1) NOT NULL,
    max_consecutive_days INT DEFAULT 0,
    notice_period_days INT DEFAULT 0,
    carry_forward_allowed BOOLEAN DEFAULT FALSE,
    max_carry_forward DECIMAL(5,1) DEFAULT 0,
    probation_period_days INT DEFAULT 0,
    applicable_after_months INT DEFAULT 0,
    gender_specific ENUM('all', 'male', 'female') DEFAULT 'all',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_leave_type (leave_type),
    INDEX idx_leave_policies_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave accruals table for tracking leave accruals over time
CREATE TABLE IF NOT EXISTS attendance_leave_accruals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('sick', 'casual', 'annual', 'maternity', 'paternity') NOT NULL,
    accrual_date DATE NOT NULL,
    leaves_accrued DECIMAL(3,1) NOT NULL,
    reason VARCHAR(255) DEFAULT 'Monthly accrual',
    financial_year VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_leave_accruals_user_id (user_id),
    INDEX idx_leave_accruals_type (leave_type),
    INDEX idx_leave_accruals_date (accrual_date),
    INDEX idx_leave_accruals_year (financial_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification logs table for tracking sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('email', 'sms', 'push') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    sent_at DATETIME,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_notification_status (status),
    INDEX idx_notification_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name VARCHAR(255) NOT NULL,
    holiday_type ENUM('company', 'national', 'regional') DEFAULT 'company',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_holidays_date (holiday_date),
    INDEX idx_holidays_type (holiday_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_corrections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    requested_punch_in DATETIME,
    requested_punch_out DATETIME,
    reason TEXT NOT NULL,
    document_path VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_remarks TEXT,
    reviewed_by INT,
    reviewed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_corrections_user_id (user_id),
    INDEX idx_corrections_date (date),
    INDEX idx_corrections_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Work Logs table for end-of-day reports
CREATE TABLE IF NOT EXISTS work_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    attendance_id INT,
    date DATE NOT NULL,
    work_description TEXT NOT NULL,
    hours_worked DECIMAL(5,2) DEFAULT 0,
    tasks_completed TEXT,
    challenges_faced TEXT,
    tomorrow_plan TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attendance_id) REFERENCES attendance_records(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_work_logs_user_id (user_id),
    INDEX idx_work_logs_date (date),
    INDEX idx_work_logs_attendance_id (attendance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- OFFER LETTER MANAGEMENT TABLES
-- ================================================================



-- ================================================================
-- PROGRESS TRACKING TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS employee_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    form_data JSON NOT NULL,
    current_step INT DEFAULT 1,
    completed_steps JSON,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_progress (user_id),
    INDEX idx_user_progress (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SUPPORT REQUESTS TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS support_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('technical', 'hr', 'payroll', 'benefits', 'other') DEFAULT 'other',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    assigned_to INT,
    resolution_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_support_user_id (user_id),
    INDEX idx_support_employee_id (employee_id),
    INDEX idx_support_status (status),
    INDEX idx_support_category (category),
    INDEX idx_support_priority (priority),
    INDEX idx_support_assigned_to (assigned_to),
    INDEX idx_support_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- MONITORING TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS admin_setup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setup_key VARCHAR(255) UNIQUE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value VARCHAR(255),
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_monitoring_name (metric_name),
    INDEX idx_monitoring_time (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- SAMPLE DATA
-- ================================================================

-- Insert sample admin users
INSERT IGNORE INTO users (fullName, email, password, mobile, role, is_admin, termsAgreed, isVerified)
VALUES ('System Admin', 'admin@hireconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9999999999', 'admin', TRUE, TRUE, TRUE);

-- Insert sample employee
INSERT IGNORE INTO users (fullName, email, password, mobile, role, is_admin, termsAgreed, isVerified)
VALUES ('John Employee', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890', 'employee', FALSE, TRUE, TRUE);

-- Sample employee profile (note: employee_profiles table doesn't have 'skills' column)
INSERT IGNORE INTO employee_profiles (
    user_id, fullName, email, mobile, position, experience
) VALUES (
    (SELECT id FROM users WHERE email = 'john@example.com'),
    'John Employee',
    'john@example.com',
    '1234567890',
    'Software Developer',
    'Fresher'
);

-- Sample onboarding status
INSERT IGNORE INTO onboarding_status (user_id, current_step)
VALUES ((SELECT id FROM users WHERE email = 'john@example.com'), 'NOT_STARTED');

-- Remove any existing admin users to ensure only our admin exists
SET SQL_SAFE_UPDATES = 0;
DELETE FROM users WHERE is_admin = TRUE OR email LIKE '%admin%';
SET SQL_SAFE_UPDATES = 1;

-- Create the ONLY admin user with specified credentials
INSERT INTO users (fullName, email, password, mobile, role, is_admin, termsAgreed, isVerified, status)
VALUES (
  'System Administrator',
  'admin@truerize.com',
  '$2a$10$voDUPosIXmZqsBHpF3kWMOw9QW99Wtbfx9NiN7S8elhWr2NlVDtce', -- bcrypt hash for 'Tbdam@583225'
  '0000000000',
  'admin',
  TRUE,
  TRUE,
  TRUE,
  'active'
) AS new_values
ON DUPLICATE KEY UPDATE
  fullName = new_values.fullName,
  password = new_values.password,
  role = new_values.role,
  is_admin = new_values.is_admin,
  isVerified = new_values.isVerified,
  status = new_values.status;



-- ================================================================
-- FIX FOR ONBOARDING STATUS ISSUE
-- ================================================================
-- If you encounter "Data truncated for column 'onboarding_status'" error,
-- run these ALTER statements to fix the column definitions:

-- ALTER TABLE users
-- MODIFY COLUMN onboarding_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE') NOT NULL DEFAULT 'NOT_STARTED';

-- ALTER TABLE users
-- MODIFY COLUMN onboarding_step INT NOT NULL DEFAULT 0;

-- ================================================================
-- FINANCE HUB TABLES
-- ================================================================

-- Employee Salary Structure table
CREATE TABLE IF NOT EXISTS employee_salary_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    hra DECIMAL(10,2) DEFAULT 0,
    conveyance_allowance DECIMAL(10,2) DEFAULT 0,
    medical_allowance DECIMAL(10,2) DEFAULT 0,
    lta DECIMAL(10,2) DEFAULT 0,
    other_allowances DECIMAL(10,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    pf_employee DECIMAL(10,2) DEFAULT 0,
    esi_employee DECIMAL(10,2) DEFAULT 0,
    professional_tax DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_salary_user_id (user_id),
    INDEX idx_salary_employee_id (employee_id),
    INDEX idx_salary_active (is_active),
    INDEX idx_salary_effective (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payroll History table
CREATE TABLE IF NOT EXISTS payroll_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    payroll_month DATE NOT NULL,
    basic_salary DECIMAL(10,2) DEFAULT 0,
    hra DECIMAL(10,2) DEFAULT 0,
    conveyance_allowance DECIMAL(10,2) DEFAULT 0,
    medical_allowance DECIMAL(10,2) DEFAULT 0,
    lta DECIMAL(10,2) DEFAULT 0,
    other_allowances DECIMAL(10,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    pf_employee DECIMAL(10,2) DEFAULT 0,
    pf_employer DECIMAL(10,2) DEFAULT 0,
    esi_employee DECIMAL(10,2) DEFAULT 0,
    esi_employer DECIMAL(10,2) DEFAULT 0,
    professional_tax DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    tax_deductions DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) DEFAULT 0,
    payslip_url VARCHAR(500),
    status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
    processed_by INT,
    processed_at DATETIME,
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_payroll_user_month (user_id, payroll_month),
    INDEX idx_payroll_user_id (user_id),
    INDEX idx_payroll_employee_id (employee_id),
    INDEX idx_payroll_month (payroll_month),
    INDEX idx_payroll_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compliance Rules table
CREATE TABLE IF NOT EXISTS compliance_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_type ENUM('pf', 'esi', 'professional_tax') NOT NULL,
    state VARCHAR(100),
    min_salary DECIMAL(10,2) DEFAULT 0,
    max_salary DECIMAL(10,2) DEFAULT 0,
    employee_percentage DECIMAL(5,2) DEFAULT 0,
    employer_percentage DECIMAL(5,2) DEFAULT 0,
    fixed_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE DEFAULT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_compliance_type (rule_type),
    INDEX idx_compliance_state (state),
    INDEX idx_compliance_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tax Declarations table
CREATE TABLE IF NOT EXISTS tax_declarations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    declaration_type ENUM('80c', '80d', 'hra', 'lta', 'other') NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    document_path VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    financial_year VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tax_user_id (user_id),
    INDEX idx_tax_employee_id (employee_id),
    INDEX idx_tax_type (declaration_type),
    INDEX idx_tax_status (status),
    INDEX idx_tax_year (financial_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reimbursements table
CREATE TABLE IF NOT EXISTS reimbursements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    claim_type ENUM('travel', 'food', 'internet', 'medical', 'other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    bill_date DATE NOT NULL,
    document_path VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    approved_by INT,
    approved_at DATETIME,
    paid_at DATETIME,
    rejection_reason TEXT,
    payroll_month DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reimb_user_id (user_id),
    INDEX idx_reimb_employee_id (employee_id),
    INDEX idx_reimb_type (claim_type),
    INDEX idx_reimb_status (status),
    INDEX idx_reimb_payroll_month (payroll_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Form 16 History table
CREATE TABLE IF NOT EXISTS form16_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id INT,
    financial_year VARCHAR(10) NOT NULL,
    form16_url VARCHAR(500),
    generated_at DATETIME,
    generated_by INT,
    total_income DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    taxable_income DECIMAL(10,2) DEFAULT 0,
    tax_paid DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_form16_user_year (user_id, financial_year),
    INDEX idx_form16_user_id (user_id),
    INDEX idx_form16_year (financial_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- NOTIFICATIONS SYSTEM TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    target_type ENUM('all', 'employee', 'department', 'admin') DEFAULT 'all',
    target_id VARCHAR(255) DEFAULT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    expires_at DATETIME DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_target (target_type, target_id),
    INDEX idx_notifications_created_by (created_by),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_notification_user (notification_id, user_id),
    INDEX idx_reads_notification_id (notification_id),
    INDEX idx_reads_user_id (user_id),
    INDEX idx_reads_read_at (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- VERIFICATION & STATUS
-- ================================================================

SHOW TABLES;

SELECT
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT
    'employee_profiles' as table_name,
    COUNT(*) as record_count
FROM employee_profiles
UNION ALL
SELECT
    'onboarding_status' as table_name,
    COUNT(*) as record_count
FROM onboarding_status
UNION ALL
SELECT
    'onboarding_answers' as table_name,
    COUNT(*) as record_count
FROM onboarding_answers
UNION ALL
SELECT
    'documents' as table_name,
    COUNT(*) as record_count
FROM documents
UNION ALL

SELECT
    'employee_progress' as table_name,
    COUNT(*) as record_count
FROM employee_progress
UNION ALL
SELECT
    'support_requests' as table_name,
    COUNT(*) as record_count
FROM support_requests
UNION ALL
SELECT
    'attendance_records' as table_name,
    COUNT(*) as record_count
FROM attendance_records
UNION ALL
SELECT
    'attendance_holidays' as table_name,
    COUNT(*) as record_count
FROM attendance_holidays
UNION ALL
SELECT
    'attendance_corrections' as table_name,
    COUNT(*) as record_count
FROM attendance_corrections
UNION ALL
SELECT
    'attendance_settings' as table_name,
    COUNT(*) as record_count
FROM attendance_settings
UNION ALL
SELECT
    'work_logs' as table_name,
    COUNT(*) as record_count
FROM work_logs
UNION ALL
SELECT
    'attendance_breaks' as table_name,
    COUNT(*) as record_count
FROM attendance_breaks
UNION ALL
SELECT
    'attendance_leaves' as table_name,
    COUNT(*) as record_count
FROM attendance_leaves
UNION ALL
SELECT
    'notification_logs' as table_name,
    COUNT(*) as record_count
FROM notification_logs
UNION ALL
SELECT
    'employee_salary_structure' as table_name,
    COUNT(*) as record_count
FROM employee_salary_structure
UNION ALL
SELECT
    'payroll_history' as table_name,
    COUNT(*) as record_count
FROM payroll_history
UNION ALL
SELECT
    'compliance_rules' as table_name,
    COUNT(*) as record_count
FROM compliance_rules
UNION ALL
SELECT
    'tax_declarations' as table_name,
    COUNT(*) as record_count
FROM tax_declarations
UNION ALL
SELECT
    'reimbursements' as table_name,
    COUNT(*) as record_count
FROM reimbursements
UNION ALL
SELECT
    'form16_history' as table_name,
    COUNT(*) as record_count
FROM form16_history
UNION ALL
SELECT
    'notifications' as table_name,
    COUNT(*) as record_count
FROM notifications
UNION ALL
SELECT
    'notification_reads' as table_name,
    COUNT(*) as record_count
FROM notification_reads
UNION ALL
SELECT
    'audit_logs' as table_name,
    COUNT(*) as record_count
FROM audit_logs
UNION ALL
SELECT
    'activities' as table_name,
    COUNT(*) as record_count
FROM activities
UNION ALL
SELECT
    'job_postings' as table_name,
    COUNT(*) as record_count
FROM job_postings
UNION ALL
SELECT
    'login_logs' as table_name,
    COUNT(*) as record_count
FROM login_logs
UNION ALL
SELECT
    'account_logs' as table_name,
    COUNT(*) as record_count
FROM account_logs
UNION ALL
SELECT
    'admin_setup' as table_name,
    COUNT(*) as record_count
FROM admin_setup
UNION ALL
SELECT
    'system_monitoring' as table_name,
    COUNT(*) as record_count
FROM system_monitoring
UNION ALL
SELECT
    'employees' as table_name,
    COUNT(*) as record_count
FROM employees;

SELECT '✅ HireConnect Portal database initialized successfully!' AS status_message;

-- ================================================================
-- END OF SCRIPT
-- ================================================================
