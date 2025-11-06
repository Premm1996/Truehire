const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');

const sessionManager = {
  // Generate JWT token
  generateToken: (candidateId) => {
    return jwt.sign({ candidateId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
  },

  // Verify token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return null;
    }
  },

  // Check candidate onboarding status
  getOnboardingStatus: async (candidateId) => {
    const OnboardingStatus = require('../models/OnboardingStatus');
    const status = await OnboardingStatus.findOne({ candidateId });
    
    if (!status) {
      return { stage: 'profile', completed: false };
    }

    // Check if failed and retry period is active
    if (status.failedAt && status.failedAt.retryAfter > new Date()) {
      return { 
        stage: 'failed', 
        completed: false, 
        retryAfter: status.failedAt.retryAfter 
      };
    }

    // Check if onboarding is complete
    if (status.idCard && status.documentsUploaded && status.offerLetter) {
      return { stage: 'completed', completed: true };
    }

    return { 
      stage: status.currentStage, 
      completed: false,
      interviewRounds: status.interviewRounds,
      documentsUploaded: status.documentsUploaded
    };
  },

  // Auto-logout on failure
  handleFailure: async (candidateId) => {
    const OnboardingStatus = require('../models/OnboardingStatus');
    await OnboardingStatus.findOneAndUpdate(
      { candidateId },
      { 
        failedAt: {
          stage: 'interview',
          failedAt: new Date(),
          retryAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    );
  }
};

module.exports = sessionManager;
