const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendCandidateStatusUpdate(candidateEmail, candidateName, status) {
    const subject = `Application Status Update - ${candidateName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Status Update</h2>
        <p>Dear ${candidateName},</p>
        <p>Your application status has been updated to: <strong>${status}</strong></p>
        <p>Please log into your dashboard to view more details.</p>
        <p>Best regards,<br>HireConnect Team</p>
      </div>
    `;
    
    return this.sendEmail(candidateEmail, subject, html);
  }

  async sendWelcomeEmail(candidateEmail, candidateName) {
    const subject = 'Welcome to HireConnect!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to HireConnect!</h2>
        <p>Dear ${candidateName},</p>
        <p>Thank you for registering with HireConnect. Your account has been created successfully.</p>
        <p>You can now access your dashboard and start your application process.</p>
        <p>Best regards,<br>HireConnect Team</p>
      </div>
    `;
    
    return this.sendEmail(candidateEmail, subject, html);
  }
}

module.exports = new EmailService();
