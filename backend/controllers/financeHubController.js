const EmployeeSalaryStructure = require('../models/EmployeeSalaryStructure');
const PayrollHistory = require('../models/PayrollHistory');
const ComplianceRules = require('../models/ComplianceRules');
const TaxDeclarations = require('../models/TaxDeclarations');
const Reimbursements = require('../models/Reimbursements');

const financeHubController = {
  // Employee Salary Structure APIs
  async getSalaryStructure(req, res) {
    try {
      const userId = req.user.id;
      const salaryStructure = await EmployeeSalaryStructure.findByUserId(userId);
      res.json(salaryStructure);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createSalaryStructure(req, res) {
    try {
      const userId = req.user.id;
      const data = { ...req.body, user_id: userId };
      const newStructure = await EmployeeSalaryStructure.create(data);
      res.status(201).json(newStructure);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateSalaryStructure(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const updated = await EmployeeSalaryStructure.update(id, data);
      if (updated) {
        res.json({ message: 'Salary structure updated successfully' });
      } else {
        res.status(404).json({ error: 'Salary structure not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Payroll History APIs
  async getPayrollHistory(req, res) {
    try {
      const userId = req.user.id;
      const payrolls = await PayrollHistory.findByUserId(userId);
      res.json(payrolls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPayrollHistoryById(req, res) {
    try {
      const employeeId = req.params.id;

      // Check if user is accessing their own payroll history or is admin
      if (req.user.id != employeeId && req.user.role !== 'admin') {
        console.warn(`Access denied for user ${req.user.id} to payroll history of employee ${employeeId}`);
        return res.status(403).json({ error: 'Access denied' });
      }

      console.log(`Fetching payroll history for employee ID: ${employeeId}, requested by user ID: ${req.user.id}`);
      const payrolls = await PayrollHistory.findByUserId(employeeId);
      res.json(payrolls);
    } catch (error) {
      console.error('Error fetching payroll history:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createPayrollRecord(req, res) {
    try {
      const data = req.body;
      const newPayroll = await PayrollHistory.create(data);
      res.status(201).json(newPayroll);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Compliance Rules API
  async getComplianceRules(req, res) {
    try {
      const rules = await ComplianceRules.findAll();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Tax Declarations APIs
  async getTaxDeclarations(req, res) {
    try {
      const userId = req.user.id;
      const declarations = await TaxDeclarations.findByUserId(userId);
      res.json(declarations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createTaxDeclaration(req, res) {
    try {
      const userId = req.user.id;
      const data = { ...req.body, user_id: userId };
      const newDeclaration = await TaxDeclarations.create(data);
      res.status(201).json(newDeclaration);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateTaxDeclarationStatus(req, res) {
    try {
      const id = req.params.id;
      const { status, approvedBy, rejectionReason } = req.body;

      let updated = false;
      if (status === 'approved') {
        updated = await TaxDeclarations.approve(id, approvedBy);
      } else if (status === 'rejected') {
        updated = await TaxDeclarations.reject(id, approvedBy, rejectionReason);
      }

      if (updated) {
        res.json({ message: 'Tax declaration status updated successfully' });
      } else {
        res.status(404).json({ error: 'Tax declaration not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Reimbursements APIs
  async getReimbursements(req, res) {
    try {
      const userId = req.user.id;
      const reimbursements = await Reimbursements.findByUserId(userId);
      res.json(reimbursements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createReimbursement(req, res) {
    try {
      const userId = req.user.id;
      const data = { ...req.body, user_id: userId };
      const newReimbursement = await Reimbursements.create(data);
      res.status(201).json(newReimbursement);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateReimbursementStatus(req, res) {
    try {
      const id = req.params.id;
      const { status, approvedBy, rejectionReason } = req.body;

      let updated = false;
      if (status === 'approved') {
        updated = await Reimbursements.approve(id, approvedBy);
      } else if (status === 'rejected') {
        updated = await Reimbursements.reject(id, approvedBy, rejectionReason);
      } else if (status === 'paid') {
        updated = await Reimbursements.markAsPaid(id);
      }

      if (updated) {
        res.json({ message: 'Reimbursement status updated successfully' });
      } else {
        res.status(404).json({ error: 'Reimbursement not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Admin APIs
  async getAllPayrollHistory(req, res) {
    try {
      const payrolls = await PayrollHistory.findAll();
      res.json(payrolls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllTaxDeclarations(req, res) {
    try {
      const declarations = await TaxDeclarations.findAll();
      res.json(declarations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllReimbursements(req, res) {
    try {
      const reimbursements = await Reimbursements.findAll();
      res.json(reimbursements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllSalaryStructures(req, res) {
    try {
      const structures = await EmployeeSalaryStructure.findAll();
      res.json(structures);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = financeHubController;
