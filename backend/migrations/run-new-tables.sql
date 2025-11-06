-- Drop existing tax_declarations table if it exists with wrong schema
DROP TABLE IF EXISTS tax_declarations;

-- Create tax_declarations table for employee tax declaration management
CREATE TABLE tax_declarations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  financial_year VARCHAR(10) NOT NULL,
  income_from_salary DECIMAL(15,2) DEFAULT 0,
  income_from_other_sources DECIMAL(15,2) DEFAULT 0,
  house_property_income DECIMAL(15,2) DEFAULT 0,
  capital_gains DECIMAL(15,2) DEFAULT 0,
  other_income DECIMAL(15,2) DEFAULT 0,
  total_income DECIMAL(15,2) DEFAULT 0,
  standard_deduction DECIMAL(10,2) DEFAULT 50000,
  section_80c_deductions DECIMAL(15,2) DEFAULT 0,
  section_80d_deductions DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  taxable_income DECIMAL(15,2) DEFAULT 0,
  tax_payable DECIMAL(15,2) DEFAULT 0,
  tax_already_paid DECIMAL(15,2) DEFAULT 0,
  refund_due DECIMAL(15,2) DEFAULT 0,
  status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
  submitted_at TIMESTAMP NULL,
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  documents JSON NULL,
  remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id),

  INDEX idx_user_id (user_id),
  INDEX idx_financial_year (financial_year),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
);

-- Insert sample tax declaration data for testing
INSERT IGNORE INTO tax_declarations (user_id, financial_year, income_from_salary, total_income, standard_deduction, taxable_income, tax_payable, status, submitted_at) VALUES
(1, '2023-24', 720000.00, 720000.00, 50000.00, 670000.00, 45000.00, 'approved', '2024-01-15 10:00:00'),
(2, '2023-24', 600000.00, 600000.00, 50000.00, 550000.00, 25000.00, 'submitted', '2024-01-20 14:30:00');

-- Create payroll_history table for employee payroll history management
CREATE TABLE IF NOT EXISTS payroll_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  payroll_month VARCHAR(20) NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  hra DECIMAL(10,2) DEFAULT 0,
  conveyance DECIMAL(10,2) DEFAULT 0,
  medical DECIMAL(10,2) DEFAULT 0,
  lta DECIMAL(10,2) DEFAULT 0,
  special_allowance DECIMAL(10,2) DEFAULT 0,
  other_allowances DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL,
  provident_fund DECIMAL(10,2) DEFAULT 0,
  professional_tax DECIMAL(10,2) DEFAULT 0,
  income_tax DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),

  UNIQUE KEY unique_user_payroll_month (user_id, payroll_month),
  INDEX idx_user_id (user_id),
  INDEX idx_payroll_month (payroll_month),
  INDEX idx_payment_status (payment_status),
  INDEX idx_payment_date (payment_date)
);

-- Insert sample payroll history data for testing
INSERT IGNORE INTO payroll_history (user_id, payroll_month, basic_salary, hra, conveyance, medical, lta, special_allowance, total_earnings, provident_fund, professional_tax, income_tax, total_deductions, net_salary, payment_date, payment_status, payment_method, remarks, created_by) VALUES
(1, '2024-12', 60000.00, 12000.00, 1920.00, 1250.00, 5000.00, 8000.00, 88170.00, 7200.00, 235.00, 8500.00, 15935.00, 72235.00, '2024-12-25', 'paid', 'Bank Transfer', 'December 2024 salary payment', 1),
(2, '2024-12', 55000.00, 11000.00, 1920.00, 1250.00, 4500.00, 7000.00, 80670.00, 6600.00, 235.00, 7800.00, 14635.00, 66035.00, '2024-12-25', 'paid', 'Bank Transfer', 'December 2024 salary payment', 1),
(1, '2024-11', 60000.00, 12000.00, 1920.00, 1250.00, 5000.00, 8000.00, 88170.00, 7200.00, 235.00, 8200.00, 15635.00, 72535.00, '2024-11-25', 'paid', 'Bank Transfer', 'November 2024 salary payment', 1);

-- Create leave_policies table
CREATE TABLE IF NOT EXISTS leave_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_type ENUM('annual', 'sick', 'casual', 'maternity', 'paternity') NOT NULL UNIQUE,
    annual_allocation DECIMAL(5,2) DEFAULT 0,
    max_carry_forward DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default leave policies
INSERT IGNORE INTO leave_policies (leave_type, annual_allocation, max_carry_forward) VALUES
('annual', 12.00, 5.00),
('sick', 6.00, 0.00),
('casual', 6.00, 0.00),
('maternity', 84.00, 0.00),
('paternity', 5.00, 0.00);
