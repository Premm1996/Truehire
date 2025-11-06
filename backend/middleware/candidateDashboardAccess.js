const Candidate = require('../models/Candidate');
const CandidateProgress = require('../models/CandidateProgress');

/**
 * Middleware to check if candidate can access dashboard
 * Only allows access if:
 * 1. Full onboarding process is completed
 * 2. ID card has been generated
 */
async function checkDashboardAccess(req, res, next) {
  try {
    const candidateId = req.user?.candidateId;
    
    if (!candidateId) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        redirectTo: '/login' 
      });
    }

    // Get candidate details
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res.status(404).json({ 
        error: 'Candidate not found', 
        redirectTo: '/register' 
      });
    }

    // Get onboarding progress
    const progress = await CandidateProgress.findOne({ 
      where: { candidateId } 
    });

    if (!progress) {
      return res.status(403).json({ 
        error: 'Onboarding not started', 
        redirectTo: '/candidate-onboarding' 
      });
    }

    // Check if full process is completed
    const isProcessCompleted = progress.onboardingCompleted && 
                              progress.idCardGenerated;

    if (!isProcessCompleted) {
      // Determine where to redirect based on current progress
      let redirectTo = '/candidate-onboarding';
      
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
    req.candidateProgress = progress;
    next();
    
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}

module.exports = { checkDashboardAccess };
