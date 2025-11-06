# HireConnect Portal - Usage Guide

This guide provides comprehensive instructions for using the HireConnect Portal HR management system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Admin Dashboard](#admin-dashboard)
3. [Employee Dashboard](#employee-dashboard)
4. [Attendance Management](#attendance-management)
5. [Finance & Payroll](#finance--payroll)
6. [User Management](#user-management)
7. [Reports & Analytics](#reports--analytics)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### First Login

1. **Access the Application**
   - Navigate to your deployed domain (e.g., `https://yourdomain.com`)
   - You'll be redirected to the login page

2. **Default Admin Credentials**
   ```
   Email: admin@hireconnect.com
   Password: admin123
   ```

3. **Change Default Password**
   - After first login, navigate to Settings
   - Update your password immediately for security

### User Roles

- **Admin/HR**: Full system access, employee management, payroll processing
- **Employee**: Personal dashboard, attendance tracking, document management

## Admin Dashboard

### Employee Management

#### Adding New Employees

1. Navigate to **Admin Dashboard > Employees**
2. Click **"Add New Employee"**
3. Fill in required information:
   - Personal details (name, email, phone)
   - Employment details (position, department, salary)
   - Account credentials
4. Upload employee photo (optional)
5. Click **"Create Employee"**

#### Managing Employee Records

- **Edit**: Click the edit icon next to any employee
- **View Profile**: Click on employee name to view full profile
- **Approve/Reject**: For pending employee registrations
- **Reset Progress**: Restart onboarding process if needed

### Attendance Oversight

#### Live Attendance Monitoring

1. Go to **Admin Dashboard > Attendance**
2. View real-time attendance status
3. Monitor active employees and break times
4. Export attendance reports

#### Managing Leave Policies

1. Navigate to **Admin > Attendance > Leave Policies**
2. Configure leave types (vacation, sick leave, etc.)
3. Set leave balances and accrual rules
4. Approve/reject leave applications

### Finance Administration

#### Payroll Processing

1. Go to **Admin > Finance > Payroll**
2. Select pay period
3. Review salary calculations
4. Process payroll and generate payslips
5. Send notifications to employees

#### Salary Structure Management

1. Navigate to **Admin > Finance > Salary Structure**
2. Define salary components (basic, HRA, conveyance, etc.)
3. Set tax calculations
4. Update employee salary structures

## Employee Dashboard

### Personal Dashboard

- **Overview**: Quick stats on attendance, leave balance, recent payslips
- **Quick Actions**: Clock in/out, submit leave requests
- **Notifications**: System alerts and updates

### Attendance Management

#### Clock In/Out

1. From dashboard, click **"Clock In"** or **"Clock Out"**
2. System records timestamp automatically
3. View today's attendance summary

#### Break Management

1. Click **"Start Break"** during work hours
2. System tracks break duration
3. Click **"End Break"** to resume work

#### Leave Applications

1. Navigate to **Attendance > Leave Application**
2. Select leave type and dates
3. Provide reason for leave
4. Submit for approval

### Finance Hub

#### Viewing Payslips

1. Go to **Finance > Payslips**
2. Select pay period
3. Download or view payslip details

#### Salary Structure

1. Navigate to **Finance > Salary Structure**
2. View current salary breakdown
3. Download salary slip

#### Reimbursements

1. Go to **Finance > Reimbursements**
2. Submit expense claims with receipts
3. Track approval status

### Document Management

#### Uploading Documents

1. Navigate to **Documents**
2. Click **"Upload Document"**
3. Select document type (ID proof, address proof, etc.)
4. Upload file and add description

#### Managing Documents

- View all uploaded documents
- Download documents
- Update document status

## Attendance Management

### For Employees

#### Daily Attendance

1. **Clock In**: Click "Clock In" button on dashboard
2. **Break**: Use "Start Break" and "End Break" buttons
3. **Clock Out**: Click "Clock Out" at end of day

#### Attendance History

1. Go to **Attendance > History**
2. View monthly attendance records
3. Check working hours and overtime

### For Admins

#### Monitoring Attendance

1. **Live View**: Admin > Attendance > Live
2. **Monthly Reports**: View attendance summaries
3. **Corrections**: Approve attendance corrections

## Finance & Payroll

### Payroll Processing (Admin)

1. **Setup Pay Period**
   - Define payroll cycle (monthly, bi-weekly)
   - Set processing dates

2. **Calculate Salaries**
   - System auto-calculates based on attendance
   - Apply deductions and bonuses

3. **Generate Payslips**
   - Automated payslip generation
   - Email delivery to employees

### Tax Management

1. **Tax Declarations**
   - Employees submit tax declarations
   - Admin reviews and approves

2. **Tax Calculations**
   - Automatic tax computation
   - Generate Form 16

## User Management

### Password Management

1. **Change Password**
   - Go to Settings > Security
   - Enter current and new password

2. **Reset Password**
   - Contact admin for password reset
   - Temporary password provided via email

### Profile Management

1. **Update Profile**
   - Edit personal information
   - Upload/update profile photo

2. **Contact Information**
   - Update phone, address, emergency contacts

## Reports & Analytics

### Available Reports

- **Attendance Reports**: Daily, weekly, monthly summaries
- **Payroll Reports**: Salary disbursements, tax reports
- **Employee Reports**: Headcount, department-wise stats
- **Finance Reports**: Expense reports, reimbursement summaries

### Generating Reports

1. Navigate to **Admin > Reports**
2. Select report type and date range
3. Choose export format (PDF, Excel)
4. Generate and download

## Troubleshooting

### Common Issues

#### Login Problems

- **Forgot Password**: Contact admin for reset
- **Account Locked**: Wait 15 minutes or contact admin
- **Invalid Credentials**: Check email and password

#### Attendance Issues

- **Clock In/Out Not Working**: Check internet connection
- **Break Timer Issues**: Refresh page and try again
- **Location Tracking**: Ensure location permissions enabled

#### Upload Problems

- **File Size Limits**: Maximum 10MB per file
- **File Types**: Check supported formats (PDF, JPG, PNG)
- **Network Issues**: Retry upload with stable connection

### Getting Help

1. **Check Logs**: Use PM2 logs for technical issues
2. **Contact Support**: Create issue in repository
3. **Documentation**: Refer to deployment guide for setup issues

### Performance Tips

- **Clear Cache**: Clear browser cache for better performance
- **Stable Connection**: Use reliable internet for attendance tracking
- **Regular Updates**: Keep application updated for latest features

---

**Note**: This guide covers the core functionality. For advanced features and API usage, refer to the main README.md file.
