-- Add approved field to users table for employee approval system
ALTER TABLE users ADD COLUMN approved BOOLEAN DEFAULT 0;

-- Update existing employees to be approved by default (only new employees will need approval)
UPDATE users SET approved = 1 WHERE role IN ('employee', 'candidate') AND createdAt < NOW();

-- Add index for better query performance
CREATE INDEX idx_users_approved ON users(approved);
