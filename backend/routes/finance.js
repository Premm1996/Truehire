const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const payrollController = require('../controllers/payrollController');
const reimbursementsController = require('../controllers/reimbursementsController');
const TaxDeclarations = require('../models/TaxDeclarations');
const SalaryStructure = require('../models/SalaryStructure');
const PayrollHistory = require('../models/PayrollHistory');
const Reimbursements = require('../models/Reimbursements');
const Payslip = require('../models/Payslip');

// Employee Finance Hub routes
router.get('/salary-structure', authenticateToken, async (req, res) => {
  try {
    const salaryStructure = await SalaryStructure.findByUserId(req.user.id);
    if (salaryStructure) {
      res.json(salaryStructure);
    } else {
      res.status(404).json({ error: 'Salary structure not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/payroll-history', authenticateToken, async (req, res) => {
  try {
    const payrolls = await PayrollHistory.findByUserId(req.user.id);
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/payroll/history/:id', authenticateToken, payrollController.getPayrollById);

// Tax Declarations routes
router.get('/tax-declarations', authenticateToken, async (req, res) => {
  try {
    const declarations = await TaxDeclarations.findByUserId(req.user.id);
    res.json(declarations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tax-declarations', authenticateToken, async (req, res) => {
  try {
    const declarationData = { ...req.body, user_id: req.user.id };
    const declaration = await TaxDeclarations.create(declarationData);
    res.status(201).json(declaration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reimbursements routes
router.get('/reimbursements', authenticateToken, async (req, res) => {
  try {
    const reimbursements = await Reimbursements.findByUserId(req.user.id);
    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reimbursements', authenticateToken, async (req, res) => {
  try {
    const reimbursementData = { ...req.body, user_id: req.user.id };
    const reimbursement = await Reimbursements.create(reimbursementData);
    res.status(201).json(reimbursement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payslips routes
router.get('/payslips', authenticateToken, async (req, res) => {
  try {
    const payslips = await Payslip.findByUserId(req.user.id);
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/payslips', authenticateToken, async (req, res) => {
  try {
    const payslipData = { ...req.body, user_id: req.user.id };
    const payslip = await Payslip.create(payslipData);
    res.status(201).json(payslip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
