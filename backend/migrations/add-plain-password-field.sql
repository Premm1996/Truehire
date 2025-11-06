-- Add plain_password field to users table to store actual passwords for admin visibility
ALTER TABLE users ADD COLUMN plain_password VARCHAR(255);

-- Update existing users to have a default password (this is for backward compatibility)
UPDATE users SET plain_password = 'DefaultPassword123' WHERE plain_password IS NULL;

-- Add index for better query performance
CREATE INDEX idx_users_plain_password ON users(plain_password);
