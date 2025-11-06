module.exports = {
  apps: [
    {
      name: "hireconnect-frontend",
      script: "node_modules/.bin/next",
      args: ["start"],
      cwd: "/var/www/hireconnect-portal/frontend",
      instances: 1, // Next.js handles its own clustering
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/hireconnect/frontend-error.log',
      out_file: '/var/log/hireconnect/frontend-out.log',
      log_file: '/var/log/hireconnect/frontend.log',
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        // AWS specific environment variables will be set via user data
        AWS_REGION: process.env.AWS_REGION || 'us-east-1'
      }
    }
  ]
}
