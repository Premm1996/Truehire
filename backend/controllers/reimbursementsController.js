const Reimbursements = require('../models/Reimbursements');

exports.getReimbursements = async (req, res) => {
  try {
    const reimbursements = await Reimbursements.findAll();
    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReimbursementsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reimbursements = await Reimbursements.findByUserId(userId);
    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createReimbursement = async (req, res) => {
  try {
    const reimbursementData = req.body;
    const reimbursement = await Reimbursements.create(reimbursementData);
    res.status(201).json(reimbursement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const success = await Reimbursements.update(id, updateData);
    if (success) {
      res.json({ message: 'Reimbursement updated successfully' });
    } else {
      res.status(404).json({ error: 'Reimbursement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Reimbursements.delete(id);
    if (success) {
      res.json({ message: 'Reimbursement deleted successfully' });
    } else {
      res.status(404).json({ error: 'Reimbursement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const success = await Reimbursements.approve(id, approvedBy);
    if (success) {
      res.json({ message: 'Reimbursement approved successfully' });
    } else {
      res.status(404).json({ error: 'Reimbursement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectReimbursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, rejectionReason } = req.body;
    const success = await Reimbursements.reject(id, approvedBy, rejectionReason);
    if (success) {
      res.json({ message: 'Reimbursement rejected successfully' });
    } else {
      res.status(404).json({ error: 'Reimbursement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markReimbursementAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate } = req.body;
    const success = await Reimbursements.markAsPaid(id, paymentDate);
    if (success) {
      res.json({ message: 'Reimbursement marked as paid successfully' });
    } else {
      res.status(404).json({ error: 'Reimbursement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
