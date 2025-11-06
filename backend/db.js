// Load environment variables using centralized loader
const { loadEnvironment } = require('./config/envLoader');
loadEnvironment();

const mysql = require('mysql2/promise');

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'hireconnect',
  password: process.env.DB_PASSWORD || 'Tbdam@583225',
  database: process.env.DB_NAME || 'hireconnect_portal',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry connection function with max retries and delay
async function connectWithRetry(maxRetries = 5, delayMs = 3000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ MySQL database connection successful!');
      connection.release();
      return pool; // Resolve with pool
    } catch (err) {
      attempt++;
      console.error(`❌ MySQL database connection failed on attempt ${attempt}:`, err.message);
      console.log('ℹ️  Please ensure MySQL is running and credentials are correct');
      console.log('🔧 Configuration:', {
        host: dbConfig.host,
        user: dbConfig.user,
        database: dbConfig.database,
        port: dbConfig.port
      });
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying connection in ${delayMs / 1000} seconds...`);
        await delay(delayMs);
      } else {
        console.error('❌ Max retries reached. Could not connect to MySQL database.');
        throw err; // Re-throw to fail server startup
      }
    }
  }
}

// Create connection promise for server startup with retry
const connectionPromise = connectWithRetry();

// Wrapper functions to mimic SQLite interface
const db = {
  // For SELECT queries returning single row
  get: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(sql, params)
      .then(([rows]) => callback(null, rows[0] || null))
      .catch(callback);
  },

  // For SELECT queries returning multiple rows
  all: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(sql, params)
      .then(([rows]) => callback(null, rows))
      .catch(callback);
  },

  // For INSERT, UPDATE, DELETE queries
  run: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.execute(sql, params)
      .then((result) => {
        // Mimic SQLite's this.lastID
        const mockThis = { lastID: result[0].insertId };
        callback.call(mockThis, null);
      })
      .catch(callback);
  },

  // Direct execute for raw queries
  execute: (sql, params = []) => {
    return pool.execute(sql, params);
  },

  // Direct query for raw queries
  query: (sql, params = []) => {
    return pool.query(sql, params);
  }
};

module.exports = db;
module.exports.pool = pool;
module.exports.connectionPromise = connectionPromise;
