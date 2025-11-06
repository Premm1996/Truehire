const nodemailer = require('nodemailer');

// Create transporter for email notifications
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

class NotificationService {
  // Send auto punch out notification
  async sendAutoPunchOutNotification(email, employeeName) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Auto Punch Out Notification - HireConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Auto Punch Out Notification</h2>
            <p>Dear ${employeeName},</p>
            <p>Your attendance has been automatically punched out at 6:30 PM as per company policy.</p>
            <p>If you believe this was done in error, please contact your administrator or submit a correction request through the employee dashboard.</p>
            <br>
            <p>Best regards,<br>HireConnect Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Auto punch out notification sent to ${email}`);
    } catch (error) {
      console.error('Error sending auto punch out notification:', error);
      // Don't throw error to prevent cron job failure
    }
  }

  // Send punch in reminder
  async sendPunchInReminder(email, employeeName) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Punch In Reminder - HireConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Punch In Reminder</h2>
            <p>Dear ${employeeName},</p>
            <p>This is a friendly reminder to punch in for today's attendance.</p>
            <p>Please log in to your employee dashboard and punch in before 9:30 AM.</p>
            <br>
            <p>Best regards,<br>HireConnect Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Punch in reminder sent to ${email}`);
    } catch (error) {
      console.error('Error sending punch in reminder:', error);
    }
  }

  // Send excessive break warning
  async sendExcessiveBreakWarning(email, employeeName, totalBreakHours) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Break Time Warning - HireConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Break Time Warning</h2>
            <p>Dear ${employeeName},</p>
            <p>You have taken ${totalBreakHours} hours of break time today.</p>
            <p>Please be mindful of your break duration to ensure productivity.</p>
            <p>If you need additional break time, please coordinate with your supervisor.</p>
            <br>
            <p>Best regards,<br>HireConnect Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Excessive break warning sent to ${email}`);
    } catch (error) {
      console.error('Error sending excessive break warning:', error);
    }
  }

  // Send leave approval notification
  async sendLeaveApprovalNotification(email, employeeName, leaveDetails) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Leave Request Update - HireConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Leave Request ${leaveDetails.status}</h2>
            <p>Dear ${employeeName},</p>
            <p>Your leave request has been <strong>${leaveDetails.status}</strong>.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Type:</strong> ${leaveDetails.type}</p>
              <p><strong>Dates:</strong> ${leaveDetails.startDate} to ${leaveDetails.endDate}</p>
              <p><strong>Reason:</strong> ${leaveDetails.reason}</p>
            </div>
            <br>
            <p>Best regards,<br>HireConnect Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Leave approval notification sent to ${email}`);
    } catch (error) {
      console.error('Error sending leave approval notification:', error);
    }
  }

  // Send correction request update
  async sendCorrectionUpdateNotification(email, employeeName, correctionDetails) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Attendance Correction Update - HireConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Correction Request ${correctionDetails.status}</h2>
            <p>Dear ${employeeName},</p>
            <p>Your attendance correction request has been <strong>${correctionDetails.status}</strong>.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Date:</strong> ${correctionDetails.date}</p>
              <p><strong>Requested In:</strong> ${correctionDetails.requestedPunchIn}</p>
              <p><strong>Requested Out:</strong> ${correctionDetails.requestedPunchOut}</p>
              <p><strong>Reason:</strong> ${correctionDetails.reason}</p>
            </div>
            <br>
            <p>Best regards,<br>HireConnect Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Correction update notification sent to ${email}`);
    } catch (error) {
      console.error('Error sending correction update notification:', error);
    }
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      const transporter = createTransporter();
      await transporter.verify();
      console.log('✅ Email configuration is working');
      return true;
    } catch (error) {
      console.error('❌ Email configuration error:', error);
      return false;
    }
  }
}

module.exports = new NotificationService();
