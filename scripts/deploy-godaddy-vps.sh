#!/bin/bash

# HireConnect Portal - GoDaddy VPS Deployment Script
# This script deploys the application after initial setup

set -e

echo "🚀 Starting HireConnect Portal Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Configuration variables
DOMAIN="truerizehireconnectportal.com"
EMAIL="admin@truerizehireconnectportal.com"
PROJECT_DIR="/var/www/hireconnect-portal"

print_status "Creating project directory and setting permissions..."
mkdir -p $PROJECT_DIR
chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR

print_status "Cloning repository..."
cd $PROJECT_DIR
if [ ! -d ".git" ]; then
    git clone https://github.com/Premm1996/hireconnect-portal.git .
else
    print_warning "Repository already exists, pulling latest changes..."
    git pull origin main
fi

print_status "Setting up backend..."
cd backend
chown -R $SUDO_USER:$SUDO_USER .
sudo -u $SUDO_USER npm install --production

print_status "Setting up frontend..."
cd ../frontend
chown -R $SUDO_USER:$SUDO_USER .
sudo -u $SUDO_USER npm install --production
sudo -u $SUDO_USER npm run build

print_status "Setting up environment files..."
cd ..
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Please create it manually with production values."
    print_warning "Required variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, etc."
else
    cp .env.production backend/.env
    cp .env.production frontend/.env.local
fi

print_status "Setting up Nginx configuration..."
cp nginx-config/hireconnect-portal-godaddy /etc/nginx/sites-available/hireconnect-portal
ln -sf /etc/nginx/sites-available/hireconnect-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

print_status "Testing Nginx configuration..."
nginx -t

print_status "Reloading Nginx..."
systemctl reload nginx

print_status "Setting up SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

print_status "Setting up PM2 startup..."
sudo -u $SUDO_USER pm2 start backend/ecosystem.config.js --env production
sudo -u $SUDO_USER pm2 start frontend/ecosystem.config.js --env production
sudo -u $SUDO_USER pm2 save
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

print_status "Setting up backup system..."
mkdir -p /var/www/backups
cat > /etc/cron.daily/hireconnect-backup << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
mysqldump -h \$DB_HOST -u \$DB_USER -p\$DB_PASSWORD \$DB_NAME > /var/www/backups/hireconnect_\$DATE.sql
find /var/www/backups -name "hireconnect_*.sql" -mtime +7 -delete
EOF
chmod +x /etc/cron.daily/hireconnect-backup

print_status "Setting up log rotation..."
cat > /etc/logrotate.d/hireconnect << EOF
/var/log/hireconnect/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_status "Running database migrations..."
cd backend
if [ -f ".env" ]; then
    sudo -u $SUDO_USER node run-production-migration.js
else
    print_warning "Backend .env not found. Please run migrations manually after setting up environment."
fi

print_status "Deployment complete!"
print_status "Application should be available at: https://$DOMAIN"
print_status ""
print_status "Next steps:"
print_status "1. Verify the application is running: curl https://$DOMAIN"
print_status "2. Check PM2 status: pm2 status"
print_status "3. Monitor logs: pm2 logs"
print_status "4. Test admin login and basic functionality"
print_status ""
print_warning "Don't forget to:"
print_warning "- Update DNS records if not already done"
print_warning "- Configure production environment variables in .env.production"
print_warning "- Set up monitoring and alerts"
print_warning "- Configure backup offsite storage"
