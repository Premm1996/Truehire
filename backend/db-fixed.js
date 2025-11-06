// Load environment variables using centralized loader
const { loadEnvironment } = require('./config/envLoader');
loadEnvironment();

const mysql = require('mysql2/promise');

// MySQL connection configuration
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = {
  host: isProduction ? (process.env.DB_HOST || process.env.RDS_HOSTNAME || 'localhost') : 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Tbdam@583225',
  database: process.env.DB_NAME || 'hireconnect_portal',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: isProduction ? 20 : 10, // Higher limit for production
  queueLimit: 0,
  ssl: isProduction ? {
    rejectUnauthorized: false,
    // For AWS RDS, you might need to specify CA bundle
    // ca: process.env.DB_SSL_CA
  } : false,
  // AWS RDS specific configurations
  connectTimeout: 60000,
  // Enable multiple statements for migrations
  multipleStatements: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Create connection promise for server startup
const connectionPromise = pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL database connection successful! (db-fixed)');
    connection.release();
    return pool; // Resolve with pool
  })
  .catch(err => {
    console.error('❌ MySQL database connection failed (db-fixed):', err.message);
    console.log('ℹ  Please ensure MySQL is running and credentials are correct');
    console.log('🔧 Configuration:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    throw err; // Re-throw to fail server startup
  });

module.exports = pool;
module.exports.connectionPromise = connectionPromise;