-- Create salary_structures table for employee salary breakdown management
CREATE TABLE IF NOT EXISTS salary_structures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE, -- One structure per employee
  basic DECIMAL(10,2) NOT NULL,
  hra DECIMAL(10,2) DEFAULT 0,
  conveyance DECIMAL(10,2) DEFAULT 1920, -- Standard conveyance allowance
  medical DECIMAL(10,2) DEFAULT 1250, -- Standard medical allowance
  lta DECIMAL(10,2) DEFAULT 0,
  special_allowance DECIMAL(10,2) DEFAULT 0,
  other_allowances DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL,
  provident_fund DECIMAL(10,2) DEFAULT 0, -- Employee PF contribution
  professional_tax DECIMAL(10,2) DEFAULT 235, -- Standard PT
  income_tax DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  effective_from DATE DEFAULT (CURRENT_DATE),
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id),

  INDEX idx_user_id (user_id),
  INDEX idx_effective_from (effective_from)
);
