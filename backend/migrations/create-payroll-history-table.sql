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
INSERT INTO payroll_history (user_id, payroll_month, basic_salary, hra, conveyance, medical, lta, special_allowance, total_earnings, provident_fund, professional_tax, income_tax, total_deductions, net_salary, payment_date, payment_status, payment_method, remarks, created_by) VALUES
(1, '2024-12', 60000.00, 12000.00, 1920.00, 1250.00, 5000.00, 8000.00, 88170.00, 7200.00, 235.00, 8500.00, 15935.00, 72235.00, '2024-12-25', 'paid', 'Bank Transfer', 'December 2024 salary payment', 1),
(2, '2024-12', 55000.00, 11000.00, 1920.00, 1250.00, 4500.00, 7000.00, 80670.00, 6600.00, 235.00, 7800.00, 14635.00, 66035.00, '2024-12-25', 'paid', 'Bank Transfer', 'December 2024 salary payment', 1),
(1, '2024-11', 60000.00, 12000.00, 1920.00, 1250.00, 5000.00, 8000.00, 88170.00, 7200.00, 235.00, 8200.00, 15635.00, 72535.00, '2024-11-25', 'paid', 'Bank Transfer', 'November 2024 salary payment', 1);
