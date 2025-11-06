-- Create tax_declarations table for employee tax declaration management
CREATE TABLE IF NOT EXISTS tax_declarations (
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
INSERT INTO tax_declarations (user_id, financial_year, income_from_salary, total_income, standard_deduction, taxable_income, tax_payable, status, submitted_at) VALUES
(1, '2023-24', 720000.00, 720000.00, 50000.00, 670000.00, 45000.00, 'approved', '2024-01-15 10:00:00'),
(2, '2023-24', 600000.00, 600000.00, 50000.00, 550000.00, 25000.00, 'submitted', '2024-01-20 14:30:00');
