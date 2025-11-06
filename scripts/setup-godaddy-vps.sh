#!/bin/bash

# HireConnect Portal - GoDaddy VPS Initial Setup Script
# This script sets up a fresh Ubuntu VPS for production deployment

set -e

echo "🚀 Starting HireConnect Portal VPS Setup..."

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

print_status "Updating system packages..."
apt update && apt upgrade -y

print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

print_status "Installing required system packages..."
apt install -y nginx mysql-client git certbot python3-certbot-nginx ufw htop monit fail2ban

print_status "Installing PM2 globally..."
npm install -g pm2

print_status "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

print_status "Creating project directory..."
mkdir -p /var/www/hireconnect-portal
chown -R www-data:www-data /var/www/hireconnect-portal

print_status "Setting up log directories..."
mkdir -p /var/log/hireconnect
chown -R www-data:www-data /var/log/hireconnect

print_status "Configuring swap space..."
# Check if swap already exists
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    print_status "Swap space configured (2GB)"
else
    print_warning "Swap space already exists"
fi

print_status "Configuring system limits..."
# Increase file limits for Node.js
cat >> /etc/security/limits.conf << EOF
www-data soft nofile 65536
www-data hard nofile 65536
EOF

print_status "Setting up automatic security updates..."
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades

print_status "Setup complete! Please reboot the server now."
print_warning "Run 'sudo reboot' to apply all changes"
print_status "After reboot, run the deployment script: ./deploy-godaddy-vps.sh"
