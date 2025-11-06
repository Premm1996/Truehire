const OnboardingStatus = require('../models/OnboardingStatus');
const Candidate = require('../models/Candidate');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/offerLetters/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const offerController = {
  uploadOfferLetter: async (req, res) => {
    try {
      const { candidateId } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const onboardingStatus = await OnboardingStatus.findOne({ candidateId });
      if (!onboardingStatus) {
        return res.status(404).json({ message: 'Onboarding status not found' });
      }
      if (onboardingStatus.currentStage !== 'offer') {
        return res.status(400).json({ message: 'Not ready for offer letter upload' });
      }
      onboardingStatus.offerLetter = {
        uploadedAt: new Date(),
        filePath: req.file.path,
        originalName: req.file.originalname
      };
      await onboardingStatus.save();
      res.json({ message: 'Offer letter uploaded successfully', filePath: req.file.path });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  downloadOfferLetter: async (req, res) => {
    try {
      const { candidateId } = req.params;
      const onboardingStatus = await OnboardingStatus.findOne({ candidateId });
      if (!onboardingStatus || !onboardingStatus.offerLetter || !onboardingStatus.offerLetter.filePath) {
        return res.status(404).json({ message: 'Offer letter not found' });
      }
      const filePath = path.resolve(onboardingStatus.offerLetter.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
      }
      res.download(filePath, onboardingStatus.offerLetter.originalName);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  signOfferLetter: async (req, res) => {
    try {
      const { candidateId } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'No signed file uploaded' });
      }
      const onboardingStatus = await OnboardingStatus.findOne({ candidateId });
      if (!onboardingStatus) {
        return res.status(404).json({ message: 'Onboarding status not found' });
      }
      if (!onboardingStatus.offerLetter || !onboardingStatus.offerLetter.uploadedAt) {
        return res.status(400).json({ message: 'No offer letter to sign' });
      }
      onboardingStatus.offerLetter.signedAt = new Date();
      onboardingStatus.offerLetter.signedFilePath = req.file.path;
      onboardingStatus.offerLetter.signedOriginalName = req.file.originalname;
      onboardingStatus.currentStage = 'id_card';
      await onboardingStatus.save();
      res.json({ message: 'Signed offer letter uploaded successfully', nextStage: 'id_card' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { offerController, upload };
