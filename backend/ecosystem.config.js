module.exports = {
  apps: [{
    name: 'hireconnect-backend',
    script: 'backend/server.js',
    cwd: '/var/www/hireconnect-portal',
    instances: 'max', // Use all CPU cores in production
    exec_mode: 'cluster', // Cluster mode for better performance
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/hireconnect/backend-error.log',
    out_file: '/var/log/hireconnect/backend-out.log',
    log_file: '/var/log/hireconnect/backend.log',
    merge_logs: true,
    env: {
      NODE_ENV: 'production',
      PORT: 5000 // Changed to match ALB backend target group
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      // AWS specific environment variables will be set via user data
      AWS_REGION: process.env.AWS_REGION || 'us-east-1'
    }
  }]
};
