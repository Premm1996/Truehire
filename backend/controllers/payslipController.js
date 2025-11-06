const PayrollHistory = require('../models/PayrollHistory');
const SalaryStructure = require('../models/SalaryStructure');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

exports.generatePayslip = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const [payroll] = await PayrollHistory.findAll().then(rows => rows.filter(p => p.id == payrollId));
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    // Generate PDF data (in real implementation, use pdfkit or puppeteer)
    const payslipData = {
      employeeName: payroll.fullName,
      employeeId: payroll.user_id,
      payrollMonth: payroll.payroll_month,
      basic: payroll.basic_salary,
      hra: payroll.hra,
      conveyance: payroll.conveyance,
      medical: payroll.medical,
      lta: payroll.lta,
      specialAllowance: payroll.special_allowance,
      otherAllowances: payroll.other_allowances,
      totalEarnings: payroll.total_earnings,
      providentFund: payroll.provident_fund,
      professionalTax: payroll.professional_tax,
      incomeTax: payroll.income_tax,
      otherDeductions: payroll.other_deductions,
      totalDeductions: payroll.total_deductions,
      netSalary: payroll.net_salary,
      paymentDate: payroll.payment_date
    };

    // Mark as generated
    await PayrollHistory.update(payrollId, { payslip_generated: true, payslip_path: `/payslips/${payrollId}.pdf` });

    res.json({ payslipData, message: 'Payslip generated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const { payrollId } = req.params;
    // In real implementation, serve the PDF file
    res.json({ message: 'Download not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendPayslipEmail = async (req, res) => {
  try {
    const { payrollId } = req.params;

    const [payroll] = await PayrollHistory.findAll().then(rows => rows.filter(p => p.id == payrollId));
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: payroll.email,
      subject: `Payslip for ${payroll.payroll_month}`,
      text: `Dear ${payroll.fullName},\n\nYour payslip for ${payroll.payroll_month} is attached.\n\nRegards,\nHR Team`,
      // attachments: [{ filename: 'payslip.pdf', path: payslipPath }]
    };

    await transporter.sendMail(mailOptions);

    // Mark as sent
    await PayrollHistory.update(payrollId, { email_sent: true });

    res.json({ message: 'Payslip email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendPayslipSMS = async (req, res) => {
  // Placeholder for SMS integration
  res.json({ message: 'SMS not implemented yet' });
};
