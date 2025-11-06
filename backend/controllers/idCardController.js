const OnboardingStatus = require('../models/OnboardingStatus');
const Candidate = require('../models/Candidate');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const idCardController = {
  generateIDCard: async (req, res) => {
    try {
      const { candidateId } = req.params;
      const onboardingStatus = await OnboardingStatus.findOne({ candidateId });
      const candidate = await Candidate.findById(candidateId);
      
      if (!onboardingStatus || !candidate) {
        return res.status(404).json({ message: 'Candidate or onboarding status not found' });
      }
      
      if (onboardingStatus.currentStage !== 'id_card') {
        return res.status(400).json({ message: 'Not ready for ID card generation' });
      }
      
      // Generate unique ID card number
      const cardNumber = `HIRE-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Create PDF document
      const doc = new PDFDocument({ size: [300, 450] });
      const fileName = `id_card_${candidateId}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '..', 'uploads', 'idCards', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      doc.pipe(fs.createWriteStream(filePath));
      
      // ID Card design
      doc.rect(0, 0, 300, 450).fill('#1e293b');
      
      // Header
      doc.rect(0, 0, 300, 80).fill('#0ea5e9');
      doc.fillColor('white').fontSize(16).text('HIRECONNECT', 20, 30);
      doc.fontSize(10).text('EMPLOYEE ID CARD', 20, 50);
      
      // Photo placeholder
      doc.rect(100, 100, 100, 100).fill('#334155').stroke('#0ea5e9');
      doc.fillColor('#94a3b8').fontSize(8).text('PHOTO', 130, 145);
      
      // Candidate details
      doc.fillColor('white').fontSize(12);
      doc.text('Name:', 20, 220);
      doc.text(`${candidate.firstName} ${candidate.lastName}`, 80, 220);
      
      doc.text('ID:', 20, 240);
      doc.text(cardNumber, 80, 240);
      
      doc.text('Email:', 20, 260);
      doc.text(candidate.email, 80, 260);
      
      doc.text('Department:', 20, 280);
      doc.text('Technology', 80, 280);
      
      doc.text('Join Date:', 20, 300);
      doc.text(new Date().toLocaleDateString(), 80, 300);
      
      // QR Code placeholder
      doc.rect(20, 340, 100, 100).fill('#334155').stroke('#0ea5e9');
      doc.fillColor('#94a3b8').fontSize(8).text('QR CODE', 45, 385);
      
      // Footer
      doc.rect(0, 400, 300, 50).fill('#0ea5e9');
      doc.fillColor('white').fontSize(8).text('This card is property of HireConnect', 20, 415);
      
      doc.end();
      
      // Update onboarding status
      onboardingStatus.idCard = {
        generatedAt: new Date(),
        filePath: filePath,
        cardNumber: cardNumber
      };
      onboardingStatus.currentStage = 'completed';
      onboardingStatus.completedAt = new Date();
      
      await onboardingStatus.save();
      
      res.json({ 
        message: 'ID card generated successfully',
        cardNumber: cardNumber,
        filePath: filePath
      });
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  downloadIDCard: async (req, res) => {
    try {
      const { candidateId } = req.params;
      const onboardingStatus = await OnboardingStatus.findOne({ candidateId });
      
      if (!onboardingStatus || !onboardingStatus.idCard || !onboardingStatus.idCard.filePath) {
        return res.status(404).json({ message: 'ID card not found' });
      }
      
      const filePath = path.resolve(onboardingStatus.idCard.filePath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'ID card file not found on server' });
      }
      
      // Mark as downloaded
      onboardingStatus.idCard.downloadedAt = new Date();
      await onboardingStatus.save();
      
      res.download(filePath, `id_card_${onboardingStatus.idCard.cardNumber}.pdf`);
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = idCardController;
