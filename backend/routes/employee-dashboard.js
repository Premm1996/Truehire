const express = require('express');
const router = express.Router();
const { checkDashboardAccess } = require('../middleware/employeeDashboardAccess');
const EmployeeProgress = require('../models/EmployeeProgress');
const { authenticateToken } = require('../middleware/auth');

// Check if employee can access dashboard
router.get('/dashboard-access/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const progress = await EmployeeProgress.findOne({
      where: { employeeId }
    });

    if (!progress) {
      return res.json({ 
        canAccess: false, 
        reason: 'Onboarding not started' 
      });
    }

    // Check if both onboarding is completed and ID card is generated
    const canAccess = progress.onboardingCompleted === true && 
                     progress.idCardGenerated === true;

    res.json({ 
      canAccess,
      currentProgress: {
        onboardingCompleted: progress.onboardingCompleted,
        idCardGenerated: progress.idCardGenerated,
        documentsUploaded: progress.documentsUploaded,
        interviewCompleted: progress.interviewCompleted
      }
    });
    
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Get employee progress and redirect path
router.get('/progress/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const progress = await EmployeeProgress.findOne({
      where: { employeeId }
    });

    if (!progress) {
      return res.json({
        redirectTo: '/employee-onboarding',
        currentProgress: null
      });
    }

    // Determine redirect path based on current progress
    let redirectTo = '/employee-onboarding';

    if (progress.onboardingCompleted && progress.idCardGenerated) {
      redirectTo = '/employee-dashboard';
    } else if (progress.onboardingCompleted && !progress.idCardGenerated) {
      redirectTo = '/generate-id-card';
    } else if (progress.documentsUploaded && !progress.onboardingCompleted) {
      redirectTo = '/offer-letter';
    } else if (progress.interviewCompleted && !progress.documentsUploaded) {
      redirectTo = '/upload-documents';
    } else if (progress.interviewScheduled && !progress.interviewCompleted) {
      redirectTo = '/interview-status';
    }

    res.json({ 
      redirectTo,
      currentProgress: {
        onboardingCompleted: progress.onboardingCompleted,
        idCardGenerated: progress.idCardGenerated,
        documentsUploaded: progress.documentsUploaded,
        interviewCompleted: progress.interviewCompleted,
        interviewScheduled: progress.interviewScheduled
      }
    });
    
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Protected dashboard route
router.get('/dashboard', checkDashboardAccess, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const progress = await EmployeeProgress.findOne({
      where: { employeeId }
    });

    res.json({
      message: 'Dashboard access granted',
      employeeProgress: progress,
      canAccess: true
    });

  } catch (error) {
    console.error('Error accessing dashboard:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
