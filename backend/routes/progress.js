const express = require('express');
const router = express.Router();
const CandidateProgress = require('../models/CandidateProgress');
const { authenticateToken } = require('../middleware/auth');

// Save progress
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { formData, currentStep, completedSteps } = req.body;
    const userId = req.user.id;

    await CandidateProgress.saveProgress(userId, {
      formData,
      currentStep,
      completedSteps
    });

    res.json({ success: true, message: 'Progress saved successfully' });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Get progress
router.get('/get', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await CandidateProgress.getProgress(userId);

    if (!progress) {
      return res.json({ 
        formData: {}, 
        currentStep: 1, 
        completedSteps: [] 
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error retrieving progress:', error);
    res.status(500).json({ error: 'Failed to retrieve progress' });
  }
});

// Update specific step
router.put('/step/:step', authenticateToken, async (req, res) => {
  try {
    const { step } = req.params;
    const { formData } = req.body;
    const userId = req.user.id;

    await CandidateProgress.updateStep(userId, parseInt(step), formData);

    res.json({ success: true, message: 'Step updated successfully' });
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// Delete progress (for testing/cleanup)
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await CandidateProgress.deleteProgress(userId);
    res.json({ success: true, message: 'Progress cleared' });
  } catch (error) {
    console.error('Error clearing progress:', error);
    res.status(500).json({ error: 'Failed to clear progress' });
  }
});

module.exports = router;
