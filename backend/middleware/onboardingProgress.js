const OnboardingStatus = require('../models/OnboardingStatus');

const onboardingProgress = {
  // Check and redirect user to correct step based on onboarding status
  checkProgress: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const status = await OnboardingStatus.findOne({ user_id: userId });
      
      if (!status) {
        return res.json({ currentStep: 'NOT_STARTED', redirectTo: '/create-account' });
      }

      // Check if interview failed and retry period
      if (status.current_step === 'INTERVIEW_FAILED' && status.interview_retry_after) {
        const canRetry = new Date() >= status.interview_retry_after;
        
        if (!canRetry) {
          return res.json({
            currentStep: 'INTERVIEW_FAILED',
            retryAfter: status.interview_retry_after,
            redirectTo: '/dashboard',
            message: 'Interview failed. Retry available after 30 days.'
          });
        }
      }

      // Map current step to redirect URL
      const stepRedirects = {
        'NOT_STARTED': '/create-account',
        'PROFILE_FILLED': '/interview',
        'INTERVIEW_SCHEDULED': '/interview',
        'INTERVIEW_ROUND_1': '/interview',
        'INTERVIEW_ROUND_2': '/interview',
        'INTERVIEW_ROUND_3': '/interview',
        'INTERVIEW_PASSED': '/upload-documents',
        'DOCS_UPLOADED': '/offer-letter',
        'OFFER_LETTER_UPLOADED': '/offer-letter',
        'OFFER_SIGNED': '/generate-id-card',
        'ID_CARD_GENERATED': '/dashboard',
        'COMPLETED': '/dashboard'
      };

      res.json({
        currentStep: status.current_step,
        redirectTo: stepRedirects[status.current_step] || '/dashboard',
        progress: status
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Middleware to protect routes based on onboarding status
  protectRoute: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const status = await OnboardingStatus.findOne({ user_id: userId });
      
      if (!status) {
        return res.redirect('/create-account');
      }

      // Allow access to dashboard for completed users
      if (status.current_step === 'COMPLETED') {
        return next();
      }

      // Check interview retry eligibility
      if (status.current_step === 'INTERVIEW_FAILED' && status.interview_retry_after) {
        const canRetry = new Date() >= status.interview_retry_after;
        if (!canRetry) {
          return res.redirect('/dashboard');
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = onboardingProgress;
