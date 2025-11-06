const OnboardingStatus = require('../models/OnboardingStatus');
const Candidate = require('../models/Candidate');

const interviewFailController = {
  // Mark interview as failed with 30-day retry
  markInterviewFailed: async (req, res) => {
    try {
      const { candidateId } = req.body;
      
      // Update onboarding status
      await OnboardingStatus.findOneAndUpdate(
        { user_id: candidateId },
        {
          current_step: 'INTERVIEW_FAILED',
          interview_failed_at: new Date(),
          interview_retry_after: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      );

      // Send failure notification
      const notificationService = require('../utils/notificationService');
      await notificationService.sendInterviewFailure(candidateId);

      res.json({ 
        success: true, 
        message: 'Interview marked as failed. Retry available after 30 days.',
        retryAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Check if candidate can retry interview
  checkRetryEligibility: async (req, res) => {
    try {
      const { candidateId } = req.params;
      
      const status = await OnboardingStatus.findOne({ user_id: candidateId });
      
      if (!status || status.current_step !== 'INTERVIEW_FAILED') {
        return res.json({ canRetry: true });
      }

      const retryAfter = status.interview_retry_after;
      const canRetry = new Date() >= retryAfter;

      res.json({
        canRetry,
        retryAfter,
        daysRemaining: Math.ceil((retryAfter - new Date()) / (1000 * 60 * 60 * 24))
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = interviewFailController;
