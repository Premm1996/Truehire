const Employee = require('../models/Employee');
const EmployeeProgress = require('../models/EmployeeProgress');

/**
 * Middleware to check if employee can access dashboard
 * Only allows access if:
 * 1. Full onboarding process is completed
 * 2. ID card has been generated
 */
async function checkDashboardAccess(req, res, next) {
  try {
    const employeeId = req.user?.id;

    if (!employeeId) {
      return res.status(401).json({
        error: 'Unauthorized',
        redirectTo: '/login'
      });
    }

    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        redirectTo: '/register'
      });
    }

    // Get onboarding progress
    const progress = await EmployeeProgress.findOne({
      where: { employeeId }
    });

    if (!progress) {
      return res.status(403).json({
        error: 'Onboarding not started',
        redirectTo: '/employee-onboarding'
      });
    }

    // Check if full process is completed
    const isProcessCompleted = progress.onboardingCompleted &&
                              progress.idCardGenerated;

    if (!isProcessCompleted) {
      // Determine where to redirect based on current progress
      let redirectTo = '/employee-onboarding';

      if (progress.onboardingCompleted && !progress.idCardGenerated) {
        redirectTo = '/generate-id-card';
      } else if (progress.documentsUploaded && !progress.onboardingCompleted) {
        redirectTo = '/offer-letter';
      } else if (progress.interviewCompleted && !progress.documentsUploaded) {
        redirectTo = '/upload-documents';
      }

      return res.status(403).json({
        error: 'Process not completed',
        redirectTo,
        currentProgress: {
          onboardingCompleted: progress.onboardingCompleted,
          idCardGenerated: progress.idCardGenerated,
          documentsUploaded: progress.documentsUploaded,
          interviewCompleted: progress.interviewCompleted
        }
      });
    }

    // Allow access to dashboard
    req.employeeProgress = progress;
    next();

  } catch (error) {
    console.error('Error checking dashboard access:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

module.exports = { checkDashboardAccess };
