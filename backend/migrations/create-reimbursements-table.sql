-- Create reimbursements table for employee reimbursement claims management
CREATE TABLE IF NOT EXISTS reimbursements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category ENUM('travel', 'medical', 'food', 'conveyance', 'telephone', 'laptop', 'training', 'other') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
  submitted_date DATE DEFAULT (CURRENT_DATE),
  approved_by INT NULL,
  approved_date TIMESTAMP NULL,
  payment_date DATE NULL,
  rejection_reason TEXT NULL,
  documents JSON NULL, -- Store file paths or URLs for uploaded bills
  remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id),

  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_submitted_date (submitted_date),
  INDEX idx_category (category)
);
