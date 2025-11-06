const pool = require('./db-fixed');

async function applyMigration() {
  try {
    console.log('Applying plain_password migration...');

    // Check if column exists first
    const [columns] = await pool.execute('DESCRIBE users');
    const columnNames = columns.map(col => col.Field);
    console.log('Current columns:', columnNames.join(', '));

    if (columnNames.includes('plain_password')) {
      console.log('✅ plain_password column already exists');
      return;
    }

    // Add the column
    console.log('Adding plain_password column...');
    await pool.execute('ALTER TABLE users ADD COLUMN plain_password VARCHAR(255)');
    console.log('✅ Column added successfully');

    // Update existing users
    console.log('Updating existing users...');
    await pool.execute("UPDATE users SET plain_password = 'DefaultPassword123' WHERE plain_password IS NULL");
    console.log('✅ Existing users updated');

    // Add index
    console.log('Adding index...');
    await pool.execute('CREATE INDEX idx_users_plain_password ON users(plain_password)');
    console.log('✅ Index created');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error.message);
    console.error('Error code:', error.code);
  }
}

applyMigration();
