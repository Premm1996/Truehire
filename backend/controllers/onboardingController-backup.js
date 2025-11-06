const db = require('../db-fixed');

class OnboardingController {
  static STEPS = {
    STEP_1: 1,
    STEP_2: 2,
    STEP_3: 3,
    STEP_4: 4,
  };

  static STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETE: 'COMPLETE',
  };

  // Get current onboarding status for user
  static async getOnboardingStatus(req, res) {
    try {
      const userId = req.user.id;
      const [rows] = await db.query(
        'SELECT onboarding_step, onboarding_status FROM users WHERE id = ?',
        [userId]
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        step: rows[0].onboarding_step || 0,
        status: rows[0].onboarding_status || 'NOT_STARTED',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get onboarding step data
  static async getStep(req, res) {
    try {
      const userId = req.user.id;
      const step = parseInt(req.params.step);

      if (step < 1 || step > 4) {
        return res.status(400).json({ error: 'Invalid step number' });
      }

      // Check if user can access this step
      const [userRows] = await db.query(
        'SELECT onboarding_step, onboarding_status FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows[0]) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentStep = userRows[0].onboarding_step || 0;
      const status = userRows[0].onboarding_status || 'NOT_STARTED';

      // If onboarding is complete, redirect to dashboard
      if (status === 'COMPLETE') {
        return res.json({ redirect: '/dashboard' });
      }

      // If trying to access step that's not the next one
      if (step !== currentStep + 1 && currentStep !== 0) {
        return res.json({ redirect: `/onboarding/step-${currentStep + 1}` });
      }

      // Get step data if exists
      const [stepData] = await db.query(
        'SELECT * FROM onboarding_answers WHERE user_id = ? AND step = ?',
        [userId, step]
      );

      res.json({
        step,
        data: stepData[0] || null,
        canProceed: true
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Submit onboarding step
  static async submitStep(req, res) {
    try {
      const userId = req.user.id;
      const step = parseInt(req.params.step);
      const stepData = req.body;

      if (step < 1 || step > 4) {
        return res.status(400).json({ error: 'Invalid step number' });
      }

      // Validate step progression
      const [userRows] = await db.query(
        'SELECT onboarding_step, onboarding_status FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows[0]) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentStep = userRows[0].onboarding_step || 0;
      const status = userRows[0].onboarding_status || 'NOT_STARTED';

      // If onboarding is complete, don't allow further submissions
      if (status === 'COMPLETE') {
        return res.status(400).json({ error: 'Onboarding already completed' });
      }

      // Can only submit current step or next step
      if (step > currentStep + 1) {
        return res.status(400).json({ error: 'Cannot skip steps' });
      }

      // Save step data
      await db.query(
        'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE data = VALUES(data), submitted_at = NOW()',
        [userId, step, JSON.stringify(stepData)]
      );

      // Update user progress
      const newStep = Math.max(currentStep, step);
      const newStatus = step === 4 ? 'COMPLETE' : 'IN_PROGRESS';

      await db.query(
        'UPDATE users SET onboarding_step = ?, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        [newStep, newStatus, userId]
      );

      // If step 4 completed, mark as complete and redirect to ID card
      if (step === 4) {
        return res.json({
          success: true,
          message: 'Step 4 completed. Generating ID card...',
          redirect: '/onboarding/step-4'
        });
      }

      // Redirect to next step
      const nextStep = step + 1;
      res.json({
        success: true,
        message: `Step ${step} completed successfully`,
        redirect: nextStep <= 4 ? `/onboarding/step-${nextStep}` : '/dashboard'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Upload offer letter (Step 3)
  static async uploadOfferLetter(req, res) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = `/uploads/offer-letters/${req.file.filename}`;

      // Save to database with status
      await db.query(
        'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?)',
        [userId, 'signed_offer_letter', req.file.originalname, filePath, 'SUBMITTED']
      );

      // Update user progress to step 4
      await db.query(
        'UPDATE users SET onboarding_step = 4, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        ['IN_PROGRESS', userId]
      );

      res.json({
        success: true,
        message: 'Offer letter uploaded successfully',
        redirect: '/onboarding/step-4'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Accept offer letter
  static async acceptOffer(req, res) {
    try {
      const userId = req.user.id;

      // Update user progress to step 4
      await db.query(
        'UPDATE users SET onboarding_step = 4, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        ['IN_PROGRESS', userId]
      );

      res.json({
        success: true,
        message: 'Offer letter accepted successfully',
        redirect: '/onboarding/step-4'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Generate ID card (Step 4)
  static async generateIdCard(req, res) {
    try {
      const userId = req.user.id;

      // Get user data for ID card
      const [userRows] = await db.query(
        'SELECT fullName, email, mobile FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows[0]) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userRows[0];
      const cardNumber = `HRC${Date.now()}${userId}`;
      const filePath = `/uploads/id-cards/${cardNumber}.pdf`;

      // Save ID card record
      await db.query(
        'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, 'id_card', `ID_Card_${cardNumber}.pdf`, filePath]
      );

      // Mark onboarding as complete
      await db.query(
        'UPDATE users SET onboarding_step = 4, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        ['COMPLETE', userId]
      );

      // Auto logout after ID card generation
      // Clear session and cookies will be handled by frontend
      res.json({
        success: true,
        message: 'ID card generated successfully. You will be logged out shortly.',
        cardNumber,
        filePath,
        redirect: '/signin',
        autoLogout: true
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get offer letter (for download) - UPDATED WITH STATUS
  static async getOfferLetter(req, res) {
    try {
      const userId = req.user.id;

      // Get user data for offer letter
      const [userRows] = await db.query(
        'SELECT fullName, email, mobile FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows[0]) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userRows[0];

      // Get onboarding form data
      const [formRows] = await db.query(
        'SELECT data FROM onboarding_answers WHERE user_id = ? AND step = 1 ORDER BY submitted_at DESC LIMIT 1',
        [userId]
      );

      let formData = {};
      if (formRows[0]) {
        try {
          if (typeof formRows[0].data === 'string') {
            formData = JSON.parse(formRows[0].data);
          } else if (typeof formRows[0].data === 'object') {
            formData = formRows[0].data;
          }
        } catch (e) {
          console.error('Error parsing form data:', e);
        }
      }

      // Check if offer letter document exists with status
      const [docRows] = await db.query(
        'SELECT file_path, status, approved_at, remarks FROM documents WHERE user_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
        [userId, 'offer_letter']
      );

      // Check if signed offer letter exists with status
      const [signedDocRows] = await db.query(
        'SELECT file_path, status, approved_at, remarks FROM documents WHERE user_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
        [userId, 'signed_offer_letter']
      );

      const offerLetterUrl = docRows[0] ? `http://localhost:5000${docRows[0].file_path}` : null;
      const signedOfferLetterUrl = signedDocRows[0] ? `http://localhost:5000${signedDocRows[0].file_path}` : null;

      // Determine overall status
      let overallStatus = 'NOT_UPLOADED';
      if (signedDocRows[0]) {
        overallStatus = signedDocRows[0].status || 'SUBMITTED';
      } else if (docRows[0]) {
        overallStatus = 'PENDING';
      }

      // Return offer letter data in expected format
      res.json({
        id: `offer_${userId}_${Date.now()}`,
        candidateName: user.fullName || formData.fullName || 'Candidate',
        position: formData.jobTitle || 'Position',
        salary: formData.accountNumber ? 'As per contract' : '$50,000', // Default salary
        startDate: formData.dateOfJoining || new Date().toISOString().split('T')[0],
        offerLetterUrl: offerLetterUrl,
        signedOfferLetterUrl: signedOfferLetterUrl,
        status: overallStatus,
        approvedAt: signedDocRows[0]?.approved_at || null,
        remarks: signedDocRows[0]?.remarks || null,
        filePath: docRows[0] ? docRows[0].file_path : null,
        signedFilePath: signedDocRows[0] ? signedDocRows[0].file_path : null
      });
    } catch (error) {
      console.error('Error getting offer letter:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Admin override: Get onboarding step data for any user
  static async getStepAdmin(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const step = parseInt(req.params.step);

      if (step < 1 || step > 4) {
        return res.status(400).json({ error: 'Invalid step number' });
      }

      // Get step data if exists
      const [stepData] = await db.query(
        'SELECT * FROM onboarding_answers WHERE user_id = ? AND step = ?',
        [userId, step]
      );

      res.json({
        step,
        data: stepData[0] || null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin override: Submit onboarding step for any user
  static async submitStepAdmin(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const step = parseInt(req.params.step);
      const stepData = req.body;

      if (step < 1 || step > 4) {
        return res.status(400).json({ error: 'Invalid step number' });
      }

      // Save step data
      await db.query(
        'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE data = VALUES(data), submitted_at = NOW()',
        [userId, step, JSON.stringify(stepData)]
      );

      // Update user progress
      const newStep = step;
      const newStatus = step === 4 ? 'COMPLETE' : 'IN_PROGRESS';

      await db.query(
        'UPDATE users SET onboarding_step = ?, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        [newStep, newStatus, userId]
      );

      res.json({
        success: true,
        message: `Step ${step} submitted successfully for user ${userId}`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin override: Get offer letter for any user
  static async getOfferLetterAdmin(req, res) {
    try {
      const userId = parseInt(req.params.userId);

      const [rows] = await db.query(
        'SELECT file_path FROM documents WHERE user_id = ? AND document_type IN (?, ?) ORDER BY uploaded_at DESC LIMIT 1',
        [userId, 'offer_letter', 'signed_offer_letter']
      );

      if (!rows[0]) {
        return res.status(404).json({ error: 'Offer letter not found' });
      }

      res.json({
        filePath: rows[0].file_path
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin override: Upload offer letter for any user
  static async uploadOfferLetterAdmin(req, res) {
    try {
      const userId = parseInt(req.params.userId);

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = `/uploads/offer-letters/admin_${Date.now()}_${req.file.filename}`;

      // Save to database with status
      await db.query(
        'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?)',
        [userId, 'signed_offer_letter', req.file.originalname, filePath, 'SUBMITTED']
      );

      // Update user progress
      await db.query(
        'UPDATE users SET onboarding_step = 4, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        ['IN_PROGRESS', userId]
      );

      res.json({
        success: true,
        message: 'Offer letter uploaded successfully',
        redirect: '/onboarding/step-4'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin override: Generate ID card for any user
  static async generateIdCardAdmin(req, res) {
    try {
      const userId = parseInt(req.params.userId);

      // Get user data for ID card
      const [userRows] = await db.query(
        'SELECT fullName, email, mobile FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows[0]) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userRows[0];
      const cardNumber = `HRC_ADMIN_${Date.now()}_${userId}`;
      const filePath = `/uploads/id-cards/${cardNumber}.pdf`;

      // Save ID card record
      await db.query(
        'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, 'id_card', `ID_Card_${cardNumber}.pdf`, filePath]
      );

      // Mark onboarding as complete
      await db.query(
        'UPDATE users SET onboarding_step = 4, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        ['COMPLETE', userId]
      );

      res.json({
        success: true,
        message: 'ID card generated successfully',
        cardNumber,
        filePath,
        redirect: '/dashboard'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Submit onboarding form with file uploads
  static async submitOnboardingForm(req, res) {
    try {
      const userId = req.user.id;
      const formData = req.body;

      // Handle file uploads
      const files = req.files || {};
      const passportPhoto = files.passportPhoto ? files.passportPhoto[0] : null;
      const resume = files.resume ? files.resume[0] : null;
      const educationCertificates = files.educationCertificates || [];
      const relievingLetters = files.relievingLetters || [];

      // Save form data to onboarding_answers table
      await db.query(
        'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE data = VALUES(data), submitted_at = NOW()',
        [userId, 1, JSON.stringify(formData)]
      );

      // Save uploaded files to documents table
      const documentInserts = [];

      if (passportPhoto) {
        documentInserts.push([
          userId,
          'passport_photo',
          passportPhoto.originalname,
          `uploads/passport-photos/${passportPhoto.filename}`,
          new Date()
        ]);
      }

      if (resume) {
        documentInserts.push([
          userId,
          'resume',
          resume.originalname,
          `uploads/resumes/${resume.filename}`,
          new Date()
        ]);
      }

      // Save education certificates
      educationCertificates.forEach(file => {
        documentInserts.push([
          userId,
          'education_certificate',
          file.originalname,
          `uploads/education-certificates/${file.filename}`,
          new Date()
        ]);
      });

      // Save relieving letters
      relievingLetters.forEach(file => {
        documentInserts.push([
          userId,
          'relieving_letter',
          file.originalname,
          `uploads/relieving-letters/${file.filename}`,
          new Date()
        ]);
      });

      // Insert all documents at once
      if (documentInserts.length > 0) {
        const placeholders = documentInserts.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const values = documentInserts.flat();
        await db.query(
          `INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at) VALUES ${placeholders}`,
          values
        );
      }

      // Sync key profile data to users table
      const profileUpdates = {};
      if (formData.fullName) profileUpdates.fullName = formData.fullName;
      if (formData.jobTitle) profileUpdates.position = formData.jobTitle;
      if (formData.mobileNumber) profileUpdates.mobile = formData.mobileNumber;

      if (Object.keys(profileUpdates).length > 0) {
        const updateFields = Object.keys(profileUpdates).map(key => `${key} = ?`).join(', ');
        const updateValues = Object.values(profileUpdates);
        updateValues.push(userId);

        await db.query(
          `UPDATE users SET ${updateFields}, updatedAt = NOW() WHERE id = ?`,
          updateValues
        );
      }

      // Sync profile data to employee_profiles table
      const photoPath = passportPhoto ? `/uploads/passport-photos/${passportPhoto.filename}` : null;

      await db.query(`
        INSERT INTO employee_profiles (
          user_id, fullName, email, mobile, dob, gender, nationality,
          qualification, specialization, college, graduationYear, cgpa,
          position, experience, expectedSalary, location, photo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          fullName = VALUES(fullName),
          email = VALUES(email),
          mobile = VALUES(mobile),
          dob = VALUES(dob),
          gender = VALUES(gender),
          nationality = VALUES(nationality),
          qualification = VALUES(qualification),
          specialization = VALUES(specialization),
          college = VALUES(college),
          graduationYear = VALUES(graduationYear),
          cgpa = VALUES(cgpa),
          position = VALUES(position),
          experience = VALUES(experience),
          expectedSalary = VALUES(expectedSalary),
          location = VALUES(location),
          photo = COALESCE(VALUES(photo), photo),
          updated_at = NOW()
      `, [
        userId,
        formData.fullName || null,
        formData.personalEmail || null,
        formData.mobileNumber || null,
        formData.dob || null,
        formData.gender || null,
        formData.nationality || null,
        formData.qualification || null,
        formData.specialization || null,
        formData.college || null,
        formData.graduationYear || null,
        formData.cgpa || null,
        formData.jobTitle || null,
        formData.experience || null,
        formData.expectedSalary || null,
        formData.workLocation || null,
        photoPath
      ]);

      // Generate a sample offer letter document
      const offerLetterFileName = `offer_letter_${userId}_${Date.now()}.pdf`;
      const offerLetterPath = `uploads/offer-letters/${offerLetterFileName}`;

      // Save offer letter document record with status
      await db.query(
        'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at, status) VALUES (?, ?, ?, ?, NOW(), ?)',
        [userId, 'offer_letter', `Offer_Letter_${userId}.pdf`, offerLetterPath, 'PENDING']
      );

      // Update user onboarding status
      await db.query(
        'UPDATE users SET onboarding_step = 1, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        ['IN_PROGRESS', userId]
      );

      res.json({
        success: true,
        message: 'Onboarding form submitted successfully',
        filesUploaded: {
          passportPhoto: !!passportPhoto,
          resume: !!resume,
          educationCertificates: educationCertificates.length,
          relievingLetters: relievingLetters.length
        },
        redirect: '/offer-letter'
      });
    } catch (error) {
      console.error('Error submitting onboarding form:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OnboardingController;
