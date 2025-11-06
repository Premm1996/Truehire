const db = require('../db');
const { auditLog } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

const dbGet = util.promisify(db.get);
const dbAll = util.promisify(db.all);
const dbRun = util.promisify(db.run);

class AdminController {
  // Get detailed employee information
  static async getEmployeeDetail(req, res) {
    try {
      console.log('🔍 getEmployeeDetail called with id:', req.params.id);
      console.log('👤 User from token:', req.user);

      const { id } = req.params;
      const adminId = req.user.id;

      // Get employee basic info
      console.log('🔍 Querying database for employee id:', id);
      const rawEmployee = await dbGet(`
        SELECT id, fullName, email, phone, position, department, onboarding_status, onboarding_step, createdAt, updatedAt
        FROM users WHERE id = ?
      `, [id]);

      console.log('📊 Query result:', rawEmployee);

      if (!rawEmployee) {
        console.log('❌ Employee not found in database');
        return res.status(404).json({ message: 'Employee not found' });
      }

      console.log('✅ Employee found:', rawEmployee);

      // Transform employee data to match frontend expectations
      const nameParts = rawEmployee.fullName ? rawEmployee.fullName.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const employee = {
        id: rawEmployee.id,
        firstName: firstName,
        lastName: lastName,
        fullName: rawEmployee.fullName,
        email: rawEmployee.email,
        phone: rawEmployee.phone,
        position: rawEmployee.position,
        department: rawEmployee.department,
        status: rawEmployee.onboarding_status || 'pending',
        onboarding_step: rawEmployee.onboarding_step,
        onboarding_status: rawEmployee.onboarding_status,
        createdAt: rawEmployee.createdAt,
        updatedAt: rawEmployee.updatedAt
      };

      // Get onboarding answers
      const step1Data = await dbAll(
        'SELECT data FROM onboarding_answers WHERE user_id = ? AND step = 1',
        [id]
      );
      const step2Data = await dbAll(
        'SELECT data FROM onboarding_answers WHERE user_id = ? AND step = 2',
        [id]
      );

      // Get documents with status
      const documents = await dbAll(
        'SELECT id, document_type, file_name, file_path, file_size, uploaded_at, status, approved_at, remarks FROM documents WHERE user_id = ?',
        [id]
      );

      // Get audit trail
      const auditTrail = await dbAll(
        'SELECT action, details, created_at FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC',
        [id]
      );

      // Audit this view
      await auditLog(id, adminId, 'VIEW_EMPLOYEE_DETAIL', {
        viewedBy: req.user.email,
        employeeEmail: employee.email
      }, req.ip, req.get('User-Agent'));

      res.json({
        employee,
        step1Data: step1Data[0] ? JSON.parse(step1Data[0].data) : null,
        step2Data: step2Data[0] ? JSON.parse(step2Data[0].data) : null,
        documents,
        auditTrail
      });
    } catch (error) {
      console.error('Error fetching employee detail:', error);
      res.status(500).json({ message: 'Failed to fetch employee details' });
    }
  }

  // Edit employee data
  static async editEmployee(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, position, department, role, status } = req.body;
      const adminId = req.user.id;

      // Combine firstName and lastName into fullName
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();

      // Update employee
      await dbRun(
        'UPDATE users SET fullName = ?, email = ?, phone = ?, position = ?, department = ?, role = ?, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        [fullName, email, phone, position, department, role, status, id]
      );

      // Audit the edit
      await auditLog(id, adminId, 'EDIT_EMPLOYEE', {
        editedBy: req.user.email,
        changes: { firstName, lastName, fullName, email, phone, position, department, role, status }
      }, req.ip, req.get('User-Agent'));

      res.json({ message: 'Employee updated successfully' });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ message: 'Failed to update employee' });
    }
  }

  // Upload/replace offer letter
  static async uploadOfferLetter(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate PDF only
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: 'Only PDF files are allowed' });
      }

      // File size limit (5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'File size must be less than 5MB' });
      }

      const filePath = `/uploads/offer-letters/admin_${Date.now()}_${req.file.originalname}`;

      // Save to database with status
      await pool.query(
        'INSERT INTO documents (user_id, document_type, file_name, file_path, file_size, uploaded_at, status) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
        [id, 'offer_letter', req.file.originalname, filePath, req.file.size, 'PENDING']
      );

      // Update user
      await pool.query(
        'UPDATE users SET offer_letter_url = ?, updatedAt = NOW() WHERE id = ?',
        [filePath, id]
      );

      // Audit the upload
      await auditLog(id, adminId, 'UPLOAD_OFFER_LETTER', {
        uploadedBy: req.user.email,
        fileName: req.file.originalname,
        fileSize: req.file.size
      }, req.ip, req.get('User-Agent'));

      res.json({
        message: 'Offer letter uploaded successfully',
        filePath
      });
    } catch (error) {
      console.error('Error uploading offer letter:', error);
      res.status(500).json({ message: 'Failed to upload offer letter' });
    }
  }

  // Validate signed offer
  static async validateOfferLetter(req, res) {
    try {
      const { id } = req.params;
      const { validated } = req.body;
      const adminId = req.user.id;

      await pool.query(
        'UPDATE users SET offer_letter_uploaded = ? WHERE id = ?',
        [validated, id]
      );

      // Audit the validation
      await auditLog(id, adminId, 'VALIDATE_OFFER_LETTER', {
        validatedBy: req.user.email,
        validated
      }, req.ip, req.get('User-Agent'));

      res.json({ message: `Offer letter ${validated ? 'validated' : 'rejected'}` });
    } catch (error) {
      console.error('Error validating offer letter:', error);
      res.status(500).json({ message: 'Failed to validate offer letter' });
    }
  }

  // New method to update offer letter status with remarks
  static async updateOfferLetterStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const adminId = req.user.id;

      // Validate status
      const validStatuses = ['APPROVED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be APPROVED or REJECTED' });
      }

      // Update the signed offer letter document status
      await pool.query(
        'UPDATE documents SET status = ?, approved_at = NOW(), approved_by = ?, remarks = ? WHERE user_id = ? AND document_type = ?',
        [status, adminId, remarks || '', id, 'signed_offer_letter']
      );

      // Also update the original offer letter status
      await pool.query(
        'UPDATE documents SET status = ? WHERE user_id = ? AND document_type = ?',
        [status, id, 'offer_letter']
      );

      // Update user onboarding status if approved
      if (status === 'APPROVED') {
        await pool.query(
          'UPDATE users SET onboarding_step = 4, onboarding_status = ? WHERE id = ?',
          ['IN_PROGRESS', id]
        );
      }

      // Audit the status update
      await auditLog(id, adminId, 'UPDATE_OFFER_LETTER_STATUS', {
        updatedBy: req.user.email,
        newStatus: status,
        remarks: remarks || ''
      }, req.ip, req.get('User-Agent'));

      res.json({
        message: `Offer letter ${status.toLowerCase()} successfully`,
        status,
        remarks
      });
    } catch (error) {
      console.error('Error updating offer letter status:', error);
      res.status(500).json({ message: 'Failed to update offer letter status' });
    }
  }

  // Generate/regenerate ID card
  static async generateIdCard(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      // Get user data
      const [users] = await pool.query(
        'SELECT fullName, email FROM users WHERE id = ?',
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const user = users[0];
      const cardNumber = `HRC_ADMIN_${Date.now()}_${id}`;
      const filePath = `/uploads/id-cards/${cardNumber}.pdf`;

      // Save ID card record
      await pool.query(
        'INSERT INTO documents (user_id, document_type, file_name, file_path, uploaded_at) VALUES (?, ?, ?, ?, NOW())',
        [id, 'id_card', `ID_Card_${cardNumber}.pdf`, filePath]
      );

      // Update user
      await pool.query(
        'UPDATE users SET id_card_generated = TRUE, updatedAt = NOW() WHERE id = ?',
        [id]
      );

      // Audit the generation
      await auditLog(id, adminId, 'GENERATE_ID_CARD', {
        generatedBy: req.user.email,
        cardNumber
      }, req.ip, req.get('User-Agent'));

      res.json({
        message: 'ID card generated successfully',
        cardNumber,
        filePath
      });
    } catch (error) {
      console.error('Error generating ID card:', error);
      res.status(500).json({ message: 'Failed to generate ID card' });
    }
  }

  // Reset employee to specific step
  static async resetStep(req, res) {
    try {
      const { id } = req.params;
      const { step } = req.body;
      const adminId = req.user.id;

      if (step < 0 || step > 4) {
        return res.status(400).json({ message: 'Invalid step number' });
      }

      const newStatus = step === 0 ? 'NOT_STARTED' : 'IN_PROGRESS';

      await pool.query(
        'UPDATE users SET onboarding_step = ?, onboarding_status = ?, updatedAt = NOW() WHERE id = ?',
        [step, newStatus, id]
      );

      // Audit the reset
      await auditLog(id, adminId, 'RESET_STEP', {
        resetBy: req.user.email,
        resetToStep: step
      }, req.ip, req.get('User-Agent'));

      res.json({ message: `Employee reset to step ${step}` });
    } catch (error) {
      console.error('Error resetting step:', error);
      res.status(500).json({ message: 'Failed to reset step' });
    }
  }

  // Mark onboarding complete/incomplete
  static async markComplete(req, res) {
    try {
      const { id } = req.params;
      const { complete } = req.body;
      const adminId = req.user.id;

      const status = complete ? 'COMPLETE' : 'IN_PROGRESS';
      const step = complete ? 4 : 3;

      await pool.query(
        'UPDATE users SET onboarding_status = ?, onboarding_step = ?, updatedAt = NOW() WHERE id = ?',
        [status, step, id]
      );

      // Audit the action
      await auditLog(id, adminId, complete ? 'MARK_COMPLETE' : 'MARK_INCOMPLETE', {
        actionBy: req.user.email,
        complete
      }, req.ip, req.get('User-Agent'));

      res.json({ message: `Onboarding marked as ${complete ? 'complete' : 'incomplete'}` });
    } catch (error) {
      console.error('Error marking complete:', error);
      res.status(500).json({ message: 'Failed to update onboarding status' });
    }
  }

  // Impersonate employee
  static async impersonate(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      // Get employee info
      const [users] = await pool.query(
        'SELECT email, fullName FROM users WHERE id = ? AND role = "employee"',
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // TODO: Implement actual impersonation token/session creation
      // For now, just audit and return success
      await auditLog(id, adminId, 'IMPERSONATE_EMPLOYEE', {
        impersonatedBy: req.user.email,
        employeeEmail: users[0].email
      }, req.ip, req.get('User-Agent'));

      res.json({
        message: 'Impersonation initiated',
        employee: users[0]
      });
    } catch (error) {
      console.error('Error impersonating:', error);
      res.status(500).json({ message: 'Failed to impersonate employee' });
    }
  }

  // Export employee data as CSV
  static async exportEmployee(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      // Get employee data
      const [users] = await pool.query(`
        SELECT fullName, email, phone, onboarding_step, onboarding_status, createdAt
        FROM users WHERE id = ?
      `, [id]);

      if (users.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const employee = users[0];

      // Create CSV content
      const csvContent = `Name,Email,Phone,Onboarding Step,Status,Created At\n"${employee.fullName}","${employee.email}","${employee.phone}",${employee.onboarding_step},"${employee.onboarding_status}","${employee.createdAt}"`;

      // Audit the export
      await auditLog(id, adminId, 'EXPORT_EMPLOYEE_DATA', {
        exportedBy: req.user.email,
        employeeEmail: employee.email
      }, req.ip, req.get('User-Agent'));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="employee_${id}_data.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting employee:', error);
      res.status(500).json({ message: 'Failed to export employee data' });
    }
  }

  // Get employee files
  static async getEmployeeFiles(req, res) {
    try {
      const { id } = req.params;

      const [documents] = await pool.query(
        'SELECT id, document_type, file_name, file_path, file_size, uploaded_at, status, approved_at, remarks FROM documents WHERE user_id = ?',
        [id]
      );

      res.json({ documents });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Failed to fetch files' });
    }
  }

  // Replace file
  static async replaceFile(req, res) {
    try {
      const { id, fileId } = req.params;
      const adminId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Get existing file
      const [existingFiles] = await pool.query(
        'SELECT file_path FROM documents WHERE id = ? AND user_id = ?',
        [fileId, id]
      );

      if (existingFiles.length === 0) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Update file record
      await pool.query(
        'UPDATE documents SET file_name = ?, file_path = ?, file_size = ?, uploaded_at = NOW() WHERE id = ?',
        [req.file.originalname, `/uploads/${req.file.originalname}`, req.file.size, fileId]
      );

      // Audit the replacement
      await auditLog(id, adminId, 'REPLACE_FILE', {
        replacedBy: req.user.email,
        fileId,
        newFileName: req.file.originalname
      }, req.ip, req.get('User-Agent'));

      res.json({ message: 'File replaced successfully' });
    } catch (error) {
      console.error('Error replacing file:', error);
      res.status(500).json({ message: 'Failed to replace file' });
    }
  }

  // Delete file
  static async deleteFile(req, res) {
    try {
      const { id, fileId } = req.params;
      const adminId = req.user.id;

      // Get file info before deletion
      const [files] = await pool.query(
        'SELECT file_path FROM documents WHERE id = ? AND user_id = ?',
        [fileId, id]
      );

      if (files.length === 0) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Delete from database
      await pool.query('DELETE FROM documents WHERE id = ?', [fileId]);

      // Audit the deletion
      await auditLog(id, adminId, 'DELETE_FILE', {
        deletedBy: req.user.email,
        fileId,
        filePath: files[0].file_path
      }, req.ip, req.get('User-Agent'));

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Failed to delete file' });
    }
  }
  // Create new employee
  static async createEmployee(req, res) {
    try {
      const adminId = req.user.id;
      const {
        fullName,
        email,
        phone,
        position,
        department,
        joiningDate,
        address,
        emergencyContact,
        emergencyPhone
      } = req.body;

      // Validate required fields
      if (!fullName || !email || !phone || !position || !department || !joiningDate) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Validate phone format (basic validation for 10-15 digits)
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }

      // Check if email already exists
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'Temp@2024';
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(tempPassword, 10);

      // Create employee
      const [result] = await pool.query(
        `INSERT INTO users (
          fullName, email, phone, position, department, password,
          role, onboarding_status, onboarding_step, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, 'employee', 'NOT_STARTED', 0, NOW(), NOW())`,
        [fullName, email, phone, position, department, hashedPassword]
      );

      const employeeId = result.insertId;

      // Handle document uploads
      const documents = [];

      if (req.files) {
        const uploadDir = 'uploads/';
        const fs = require('fs').promises;

        // Ensure upload directory exists
        try {
          await fs.access(uploadDir);
        } catch {
          await fs.mkdir(uploadDir, { recursive: true });
        }

        // Process each file
        const fileTypes = {
          idCard: 'id_card',
          offerLetter: 'offer_letter',
          nda: 'nda'
        };

        for (const [fieldName, docType] of Object.entries(fileTypes)) {
          if (req.files[fieldName]) {
            const file = req.files[fieldName][0];
            const fileName = `${Date.now()}_${fieldName}_${employeeId}_${file.originalname}`;
            const filePath = `${uploadDir}${fileName}`;

            // Move file to uploads directory
            await fs.rename(file.path, filePath);

            // Save to database
            await pool.query(
              'INSERT INTO documents (user_id, document_type, file_name, file_path, file_size, uploaded_at, status) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
              [employeeId, docType, file.originalname, filePath, file.size, 'APPROVED']
            );

            documents.push({ type: docType, fileName: file.originalname });
          }
        }
      }

      // Audit the creation
      await auditLog(employeeId, adminId, 'CREATE_EMPLOYEE', {
        createdBy: req.user.email,
        employeeData: { fullName, email, position, department },
        documentsUploaded: documents.length
      }, req.ip, req.get('User-Agent'));

      // TODO: Send invitation email with login credentials
      // For now, return temp password in response (remove in production)
      res.status(201).json({
        message: 'Employee created successfully',
        employeeId,
        documents
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ message: 'Failed to create employee' });
    }
  }
}

module.exports = AdminController;
