const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Tbdam@583225',
    database: process.env.DB_NAME || 'hireconnect_portal',
    port: process.env.DB_PORT || 3306
  });

  const sql = `CREATE TABLE IF NOT EXISTS attendance_leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type ENUM('annual', 'sick', 'casual', 'maternity', 'paternity') NOT NULL,
    allocated_days DECIMAL(5,2) DEFAULT 0,
    used_days DECIMAL(5,2) DEFAULT 0,
    carried_forward DECIMAL(5,2) DEFAULT 0,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_leave_year (user_id, leave_type, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`;

  await conn.execute(sql);
  console.log('attendance_leave_balances table created');
  conn.end();
}

createTable();
