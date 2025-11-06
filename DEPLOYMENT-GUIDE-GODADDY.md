# HireConnect Portal - GoDaddy VPS Deployment Guide

This guide provides step-by-step instructions for deploying the HireConnect Portal application on a GoDaddy VPS.

## Prerequisites

- GoDaddy VPS with Ubuntu 20.04+ (recommended)
- Domain name pointed to your VPS IP address
- SSH access to your VPS
- GitHub repository access

## Quick Start

### Step 1: Initial VPS Setup

SSH into your GoDaddy VPS and run the initial setup script:

```bash
# Download the setup script
wget https://raw.githubusercontent.com/Premm1996/hireconnect-portal/main/scripts/setup-godaddy-vps.sh

# Make it executable and run
chmod +x setup-godaddy-vps.sh
./setup-godaddy-vps.sh
```

After setup completes, reboot your VPS:

```bash
sudo reboot
```

### Step 2: Deploy Application

After reboot, SSH back in and run the deployment script:

```bash
# Download the deployment script
wget https://raw.githubusercontent.com/Premm1996/hireconnect-portal/main/scripts/deploy-godaddy-vps.sh

# Make it executable and run
chmod +x deploy-godaddy-vps.sh
./deploy-godaddy-vps.sh
```

## Manual Deployment (Alternative)

If you prefer manual setup, follow these steps:

### 1. System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
sudo apt install -y nginx mysql-client git certbot python3-certbot-nginx ufw htop monit

# Install PM2
sudo npm install -g pm2

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 2. Project Setup

```bash
# Create project directory
sudo mkdir -p /var/www/hireconnect-portal
sudo chown -R $USER:$USER /var/www/hireconnect-portal

# Clone repository
cd /var/www/hireconnect-portal
git clone https://github.com/Premm1996/hireconnect-portal.git .
```

### 3. Backend Setup

```bash
cd backend
npm install --production
cp .env.production .env
# Edit .env with your production values
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install --production
cp ../.env.production .env.local
npm run build
```

### 5. Nginx Configuration

```bash
# Copy nginx config
sudo cp ../nginx-config/hireconnect-portal-godaddy /etc/nginx/sites-available/hireconnect-portal

# Enable site
sudo ln -sf /etc/nginx/sites-available/hireconnect-portal /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6. SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d truerizehireconnectportal.com -d www.truerizehireconnectportal.com --non-interactive --agree-tos --email admin@truerizehireconnectportal.com
```

### 7. Start Services

```bash
# Start backend
cd /var/www/hireconnect-portal/backend
pm2 start ecosystem.config.js --env production

# Start frontend
cd ../frontend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## Configuration Files

### Environment Variables

Make sure to update the following files with your production values:

- `.env.production` (copy from `.env.production.example`)
- `backend/.env.production` (will be created automatically by deployment script)

Key variables to update:
- Database credentials (AWS RDS endpoint, username, password)
- JWT secrets (generate secure random strings)
- Domain settings
- Email configuration (optional)
- AWS S3 configuration (optional for file uploads)

**Example .env.production file:**
```bash
# Database Configuration (AWS RDS)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=hireconnect_production

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=production
PORT=5000
DOMAIN=truerizehireconnectportal.com
FRONTEND_URL=https://truerizehireconnectportal.com
```

### Nginx Configuration

The nginx config (`nginx-config/hireconnect-portal-godaddy`) includes:
- SSL/TLS encryption
- Gzip compression
- Security headers
- Static file caching
- API proxying
- Upload handling

## Monitoring & Maintenance

### Process Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all
```

### System Monitoring

```bash
# Check system resources
htop

# Check nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates
```

### Backup Setup

The deployment script automatically sets up daily backups:
- Database dumps in `/var/www/backups/`
- File backups retained for 7 days
- Cron job runs at 2 AM daily

### Log Rotation

Logs are automatically rotated daily and compressed.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 443, 3000, 5001 are available
2. **SSL issues**: Check certbot logs and DNS configuration
3. **Database connection**: Verify RDS security groups and credentials
4. **Memory issues**: Check swap space and system resources

### Useful Commands

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check application logs
pm2 logs hireconnect-backend
pm2 logs hireconnect-frontend

# Restart services
sudo systemctl restart nginx
pm2 restart all

# Check SSL renewal
sudo certbot renew --dry-run
```

## Security Considerations

- SSH key authentication enabled (password auth disabled)
- UFW firewall configured
- Security headers in nginx
- SSL/TLS encryption
- File permissions set correctly
- Fail2ban installed for SSH protection

## Performance Optimization

- Gzip compression enabled
- Static file caching configured
- PM2 clustering for better performance
- Swap space configured for low-memory instances
- Nginx optimizations applied

## Support

If you encounter issues:
1. Check the logs using the commands above
2. Verify your environment variables
3. Ensure DNS is properly configured
4. Check firewall and security groups

For additional help, refer to the main README.md file or create an issue in the GitHub repository.
