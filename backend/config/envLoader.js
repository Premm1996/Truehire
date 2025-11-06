// Centralized Environment Variable Loader
// Loads .env for development and .env.production for production
// Allows combining both files with production taking precedence

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

function loadEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const rootDir = path.resolve(__dirname, '../..'); // Root directory (c:/Users/Administrator/Desktop/hireconnect-portal)

  // Determine which env files to load
  const envFiles = [];

  if (!isProduction) {
    // Development: load .env first, then .env.production if it exists
    const localEnvPath = path.join(rootDir, '.env');
    const prodEnvPath = path.join(rootDir, '.env.production');

    if (fs.existsSync(localEnvPath)) {
      envFiles.push(localEnvPath);
    }
    if (fs.existsSync(prodEnvPath)) {
      envFiles.push(prodEnvPath);
    }
  } else {
    // Production: load .env.production first, then .env if it exists
    const prodEnvPath = path.join(rootDir, '.env.production');
    const localEnvPath = path.join(rootDir, '.env');

    if (fs.existsSync(prodEnvPath)) {
      envFiles.push(prodEnvPath);
    }
    if (fs.existsSync(localEnvPath)) {
      envFiles.push(localEnvPath);
    }
  }

  // Load the env files in order (later files override earlier ones)
  envFiles.forEach(envFile => {
    console.log(`🔧 Loading environment from: ${envFile}`);
    dotenv.config({ path: envFile });
  });

  // If no env files were loaded, try default .env in root or backend/.env
  if (envFiles.length === 0) {
    const defaultEnvPath = path.join(rootDir, '.env');
    const backendEnvPath = path.join(rootDir, 'backend', '.env');

    if (fs.existsSync(defaultEnvPath)) {
      console.log(`🔧 Loading default environment from: ${defaultEnvPath}`);
      dotenv.config({ path: defaultEnvPath });
    } else if (fs.existsSync(backendEnvPath)) {
      console.log(`🔧 Loading backend environment from: ${backendEnvPath}`);
      dotenv.config({ path: backendEnvPath });
    } else {
      console.log('⚠️  No environment files found (.env, .env.production, .env, or backend/.env)');
    }
  }

  // Log loaded environment
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Root directory: ${rootDir}`);
}

module.exports = { loadEnvironment };
