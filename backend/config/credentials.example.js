// backend/config/credentials.example.js
// Copy this file to credentials.js and add your actual credentials
// DO NOT commit credentials.js to version control

module.exports = {
  recruiter: {
    email: process.env.RECRUITER_EMAIL || 'recruiter@example.com',
    password: process.env.RECRUITER_PASSWORD || 'default-recruiter-password'
  },
  employer: {
    email: process.env.EMPLOYER_EMAIL || 'employer@example.com',
    password: process.env.EMPLOYER_PASSWORD || 'default-employer-password'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'default-admin-password'
  }
};
