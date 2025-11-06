const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads with proper destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    if (file.fieldname === 'passportPhoto') {
      uploadPath = 'uploads/passport-photos/';
    } else if (file.fieldname === 'resume') {
      uploadPath = 'uploads/resumes/';
    } else if (file.fieldname === 'educationCertificates') {
      uploadPath = 'uploads/education-certificates/';
    } else if (file.fieldname === 'relievingLetters') {
      uploadPath = 'uploads/relieving-letters/';
    } else if (file.fieldname === 'signedOfferLetter') {
      uploadPath = 'uploads/offer-letters/';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage });

// Candidate routes (self-access only)
router.get('/status', authenticateToken, onboardingController.getOnboardingStatus);

// New route for onboarding form submission with file uploads
const onboardingUpload = upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'educationCertificates', maxCount: 10 },
  { name: 'relievingLetters', maxCount: 10 }
]);
router.post('/onboarding-form', authenticateToken, onboardingUpload, onboardingController.submitOnboardingForm);

// Admin override routes (admin can act on behalf of any candidate)
// Note: Admin routes removed as offer letter and ID card functionality is no longer needed

module.exports = router;
