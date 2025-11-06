-- Create payroll table for employee salary management
CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INT NOT NULL,
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

  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),

  UNIQUE KEY unique_employee_month_year (employee_id, month, year),
  INDEX idx_payroll_employee_id (employee_id),
  INDEX idx_payroll_month_year (month, year),
  INDEX idx_payroll_payment_status (payment_status),
  INDEX idx_payroll_payment_date (payment_date)
);

-- Insert sample payroll data for testing
INSERT INTO payroll (employee_id, month, year, basic_salary, hra, conveyance, medical, lta, special_allowance, total_earnings, provident_fund, professional_tax, income_tax, total_deductions, net_salary, payment_date, payment_status, payment_method, remarks, created_by) VALUES
(1, 'December', 2024, 60000.00, 12000.00, 1920.00, 1250.00, 5000.00, 8000.00, 88170.00, 7200.00, 235.00, 8500.00, 15935.00, 72235.00, '2024-12-25', 'paid', 'Bank Transfer', 'December salary payment', 1),
(2, 'December', 2024, 55000.00, 11000.00, 1920.00, 1250.00, 4500.00, 7000.00, 80670.00, 6600.00, 235.00, 7800.00, 14635.00, 66035.00, '2024-12-25', 'paid', 'Bank Transfer', 'December salary payment', 1);
