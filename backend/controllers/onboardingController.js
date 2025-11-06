const db = require('../db');

class OnboardingController {
  static STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETE: 'COMPLETE',
  };

  // Get current onboarding status for user
  static async getOnboardingStatus(req, res) {
    try {
      const userId = req.user.id;
      const row = await new Promise((resolve, reject) => {
        db.get(
          'SELECT onboarding_status FROM users WHERE id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        status: row.onboarding_status || 'NOT_STARTED',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin methods removed as offer letter and ID card functionality is no longer needed

  // Submit onboarding form with file uploads - IMPROVED VERSION
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

      console.log('📝 Processing onboarding form for user:', userId);
      console.log('📋 Form data received:', formData);
      console.log('📸 Photo file:', passportPhoto ? passportPhoto.filename : 'No photo');

      // Save form data to onboarding_answers table - MySQL supports ON DUPLICATE KEY UPDATE
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO onboarding_answers (user_id, step, data, submitted_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE data = VALUES(data), submitted_at = NOW()',
          [userId, 1, JSON.stringify(formData)],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      // Save uploaded files to documents table
      const documentInserts = [];

      if (passportPhoto) {
        const photoPath = `/uploads/passport-photos/${passportPhoto.filename}`;
        documentInserts.push([
          userId,
          'passport_photo',
          passportPhoto.originalname,
          photoPath,
          new Date()
        ]);
        console.log('✅ Photo document record created:', photoPath);
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

      // Insert all documents at once - SQLite doesn't support multiple inserts in one query like MySQL
      if (documentInserts.length > 0) {
        for (const doc of documentInserts) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at) VALUES (?, ?, ?, ?, NOW())',
              [doc[0], doc[1], doc[2], doc[3]],
              function(err) {
                if (err) reject(err);
                else resolve(this);
              }
            );
          });
        }
        console.log('✅ Documents saved to database');
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

        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE users SET ${updateFields}, updatedAt = NOW() WHERE id = ?`,
            updateValues,
            function(err) {
              if (err) reject(err);
              else resolve(this);
            }
          );
        });
        console.log('✅ User profile updated in users table');
      }

      // Sync profile data to employee_profiles table with proper photo path
      const photoPath = passportPhoto ? `/uploads/passport-photos/${passportPhoto.filename}` : null;

      // First, check if employee profile already exists
      const existingProfile = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM employee_profiles WHERE user_id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingProfile) {
        // Update existing profile
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE employee_profiles SET
              fullName = ?,
              email = ?,
              mobile = ?,
              dob = ?,
              gender = ?,
              nationality = ?,
              qualification = ?,
              specialization = ?,
              college = ?,
              graduationYear = ?,
              cgpa = ?,
              position = ?,
              experience = ?,
              expectedSalary = ?,
              location = ?,
              photo = COALESCE(?, photo),
              updated_at = NOW()
            WHERE user_id = ?
          `, [
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
            photoPath,
            userId
          ], function(err) {
            if (err) reject(err);
            else resolve(this);
          });
        });
        console.log('✅ Existing employee profile updated');
      } else {
        // Create new profile
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO employee_profiles (
              user_id, fullName, email, mobile, dob, gender, nationality,
              qualification, specialization, college, graduationYear, cgpa,
              position, experience, expectedSalary, location, photo, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
          ], function(err) {
            if (err) reject(err);
            else resolve(this);
          });
        });
        console.log('✅ New employee profile created');
      }

      // Update user onboarding status to complete (single step registration)
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
          ['COMPLETE', userId],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      console.log('✅ Onboarding form submission completed successfully');

      res.json({
        success: true,
        message: 'Onboarding completed successfully. You will be logged out automatically.',
        autoLogout: true,
        filesUploaded: {
          passportPhoto: !!passportPhoto,
          resume: !!resume,
          educationCertificates: educationCertificates.length,
          relievingLetters: relievingLetters.length
        }
      });
    } catch (error) {
      console.error('❌ Error submitting onboarding form:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OnboardingController;
