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
