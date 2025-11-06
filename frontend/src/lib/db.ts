// frontend/src/lib/db.ts - TypeScript database connection for Next.js API routes
import { createPool } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

// Create a MySQL connection pool using environment variables
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Tbdam@583225',
  database: process.env.DB_NAME || 'hireconnect_portal',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 1000,
  queueLimit: 0,
});

// Test connection - disabled during build to prevent errors
// const testConnection = async () => {
//   try {
//     const conn = await pool.getConnection();
//     await conn.ping();
//     console.log('✅ MySQL connected successfully in frontend');
//     conn.release();
//   } catch (error) {
//     console.error('❌ MySQL connection failed in frontend:', error);
//   }
// };

// testConnection();

export default pool;
