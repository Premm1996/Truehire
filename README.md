# HireConnect Portal

A comprehensive HR management system built with Next.js (frontend) and Node.js/Express (backend) that streamlines employee onboarding, attendance tracking, payroll management, and administrative operations.

## 🚀 Features

### Employee Dashboard
- **Personal Dashboard**: Overview of attendance, payroll, leave balance, and recent activities
- **Attendance Management**: Real-time clock-in/out, break tracking, leave applications
- **Finance Hub**: Salary structure, payroll history, payslips, tax declarations, reimbursements
- **Document Management**: Upload and manage personal documents
- **Profile Management**: Update personal information and view employment details

### Admin Dashboard
- **Employee Management**: Add, edit, approve, and manage employee records
- **Attendance Oversight**: Monitor live attendance, manage leave policies, approve corrections
- **Finance Administration**: Payroll processing, salary structure management, reimbursement approvals
- **Analytics & Reports**: Comprehensive reporting on employee metrics and system usage
- **System Administration**: User management, notifications, and system settings

### Core Functionality
- **Onboarding Process**: Multi-step employee registration with document verification
- **Real-time Notifications**: System-wide notification system for updates and alerts
- **Role-based Access Control**: Secure access based on user roles (Admin, Employee, HR)
- **Responsive Design**: Mobile-friendly interface for all devices
- **API Integration**: RESTful API architecture for seamless data flow

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **React Hook Form** - Form management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Socket.IO** - Real-time communication
- **AWS SDK** - Cloud services integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL database (local or AWS RDS)
- Git
- PM2 (for production deployment)

## 🚀 Quick Start

### Automated Deployment (Recommended)

For GoDaddy VPS deployment, use the automated scripts:

```bash
# 1. Initial VPS Setup
wget https://raw.githubusercontent.com/Premm1996/hireconnect-portal/main/scripts/setup-godaddy-vps.sh
chmod +x setup-godaddy-vps.sh
./setup-godaddy-vps.sh

# 2. Reboot VPS
sudo reboot

# 3. Deploy Application (after reboot)
wget https://raw.githubusercontent.com/Premm1996/hireconnect-portal/main/scripts/deploy-godaddy-vps.sh
chmod +x deploy-godaddy-vps.sh
./deploy-godaddy-vps.sh
```

### Manual Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd hireconnect-portal
```

#### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 3. Environment Configuration

Create `.env.production` file with your production values:

```env
# Database Configuration
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
DOMAIN=yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email Configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# AWS Configuration (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

#### 4. Database Setup
```bash
# Run database migrations
node run-production-migration.js

# Optional: Create sample data
node backend/create-sample-data-mysql.js
```

#### 5. Build and Start

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start backend with PM2
cd backend
pm2 start ecosystem.config.js --env production

# Start frontend with PM2
cd ../frontend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📁 Project Structure

```
hireconnect-portal/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages and API routes
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Utility functions and configurations
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express.js backend application
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   ├── database/         # Database scripts and migrations
│   ├── migrations/       # Database migration files
│   └── package.json
├── scripts/               # Deployment scripts
├── nginx-config/         # Nginx configuration files
├── DEPLOYMENT-GUIDE-GODADDY.md  # Detailed deployment guide
├── USAGE-GUIDE.md        # User usage instructions
└── README.md
```

## 🔧 Available Scripts

### Root Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start production servers
- `npm run dev:frontend` - Start only frontend development server
- `npm run dev:backend` - Start only backend development server

### Frontend Scripts (cd frontend)
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend Scripts (cd backend)
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Employee Management
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id/profile` - Get employee profile
- `PUT /api/employees/:id/profile` - Update employee profile

### Attendance
- `POST /api/attendance/punch-in` - Clock in
- `POST /api/attendance/punch-out` - Clock out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/summary/:id` - Get attendance summary

### Finance
- `GET /api/finance/payroll-history` - Get payroll history
- `GET /api/finance/salary-structure` - Get salary structure
- `POST /api/finance/reimbursements` - Submit reimbursement

### Admin Endpoints
- `GET /api/admin/employees` - Admin employee management
- `GET /api/admin/attendance/live` - Live attendance monitoring
- `PUT /api/admin/finance/payroll-history/:id` - Update payroll

## 🔐 User Roles & Permissions

### Employee
- View personal dashboard and profile
- Manage attendance and leave applications
- Access finance information and payslips
- Submit reimbursements and tax declarations

### Admin/HR
- Full access to employee management
- Attendance monitoring and approval
- Finance administration and payroll processing
- System configuration and reporting

## 🧪 Testing

### Database Connection Test
```bash
node backend/diagnose-env.js
```

### Password Verification
```bash
node check_password.js
```

### API Testing
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## 🚀 Deployment

### Production Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates obtained
- [ ] Nginx configured
- [ ] PM2 processes started
- [ ] Firewall configured
- [ ] Backup system set up
- [ ] Monitoring enabled

### Monitoring Commands

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs

# Monitor system resources
htop

# Check nginx status
sudo systemctl status nginx
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Check the [Usage Guide](./USAGE-GUIDE.md) for detailed user instructions
- Check the [Deployment Guide](./DEPLOYMENT-GUIDE-GODADDY.md) for detailed setup instructions
- Review the troubleshooting section in the deployment guide
- Create an issue in the repository
- Check application logs using PM2 commands

## 🔄 Version History

### v1.0.0
- Initial release with core HR management features
- Employee and admin dashboards
- Attendance tracking system
- Finance and payroll management
- Document management system
- Production-ready deployment scripts

---

**Note**: This application is designed for internal HR management use. Ensure proper security measures are implemented before deployment in production environments.
