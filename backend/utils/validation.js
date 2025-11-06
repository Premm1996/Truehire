const validator = require('validator');

class ValidationService {
  static validateEmail(email) {
    return validator.isEmail(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }

  static validateCandidateData(data) {
    const errors = [];

    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (!data.email || !this.validateEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.phone || !this.validatePhone(data.phone)) {
      errors.push('Valid phone number is required');
    }

    if (!data.position || data.position.trim().length < 2) {
      errors.push('Position is required');
    }

    if (!data.experience || data.experience.trim().length < 1) {
      errors.push('Experience is required');
    }

    if (!data.skills || data.skills.trim().length < 2) {
      errors.push('Skills are required');
    }

    if (!data.education || data.education.trim().length < 2) {
      errors.push('Education is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return validator.escape(input.trim());
  }

  static validateFileUpload(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 5MB limit.'
      };
    }

    return { isValid: true };
  }
}

module.exports = ValidationService;
