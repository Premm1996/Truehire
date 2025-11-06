// backend/db.ts
import 'dotenv/config';
import { createPool } from 'mysql2/promise';


const pool = createPool({

  host: process.env.DB_HOST || 'localhost',

  user: process.env.DB_USER || 'root',

  password: process.env.DB_PASSWORD || 'Tbdam@583225',

  database: process.env.DB_NAME || 'hireconnect_portal',

  port: parseInt(process.env.DB_PORT) || 3306,

  waitForConnections: true,

  connectionLimit: 100,

  queueLimit: 0,


  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,


});


export default pool;
