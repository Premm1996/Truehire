// Environment variable validation utility - Updated for MySQL
// Load environment variables using centralized loader
const { loadEnvironment } = require('../config/envLoader');
loadEnvironment();

class EnvironmentValidator {
  static requiredVariables = [
    'JWT_SECRET',
    'NODE_ENV',
    'PORT'
  ];

  static optionalInDevVariables = [
    'DB_TYPE' // MySQL is now the default
  ];

  static validate() {
    const missing = [];
    const warnings = [];

    // Debug log for JWT_SECRET presence (mask value)
    if (process.env.JWT_SECRET) {
      console.log('🔍 JWT_SECRET is set (masked):', '*'.repeat(8));
    } else {
      console.log('🔍 JWT_SECRET is NOT set');
    }

    // Set default values for development if not provided
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'development') {
      console.log('⚠️  Setting default JWT_SECRET for development');
      process.env.JWT_SECRET = 'dev-jwt-secret-key-change-in-production-123456789';
    }

    if (!process.env.NODE_ENV) {
      console.log('⚠️  Setting default NODE_ENV for development');
      process.env.NODE_ENV = 'development';
    }

    if (!process.env.PORT && process.env.NODE_ENV === 'development') {
      console.log('⚠️  Setting default PORT for development');
      process.env.PORT = '5000';
    }

    // Set MySQL as default database type
    if (!process.env.DB_TYPE) {
      console.log('⚠️  Setting default DB_TYPE to mysql');
      process.env.DB_TYPE = 'mysql';
    }

    // Check required variables
    for (const variable of this.requiredVariables) {
      if (!process.env[variable]) {
        missing.push(variable);
      }
    }

    // Check for default/weak values
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      warnings.push('JWT_SECRET is using the default value. Change this in production!');
    }

    if (process.env.DB_PASSWORD === 'your_mysql_password_here') {
      warnings.push('DB_PASSWORD is using the default value. Change this in production!');
    }

    if (process.env.NODE_ENV === 'development') {
      warnings.push('Running in development mode. Set NODE_ENV=production for production.');
    }

    return { missing, warnings };
  }

  static getConfig() {
    const config = {
      database: {
        type: process.env.DB_TYPE || 'mysql',
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Tbdam@583225',
        database: process.env.DB_NAME || 'hireconnect_portal',
        port: process.env.DB_PORT || 3306
      },
      jwt: {
        secret: process.env.JWT_SECRET
      },
      server: {
        port: parseInt(process.env.PORT || '5000'),
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      cors: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      }
    };

    return config;
  }

  static ensureRequired() {
    const { missing, warnings } = this.validate();
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (warnings.length > 0) {
      warnings.forEach(warning => console.warn(`⚠️  WARNING: ${warning}`));
    }

    return this.getConfig();
  }
}

module.exports = EnvironmentValidator;
