// Load environment variables using centralized loader
const { loadEnvironment } = require('./config/envLoader');
loadEnvironment();

const express = require('express');
const cors = require('cors');
const db = require('./db'); // Use MySQL database connection instead of SQLite
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/admin-auth');
const onboardingRoutes = require('./routes/onboarding');
const formsRoutes = require('./routes/forms');
const progressRoutes = require('./routes/progress');
const usersRoutes = require('./routes/users');
const candidateDashboardRoutes = require('./routes/candidate-dashboard');
const employeeRoutes = require('./routes/employees');
const employeeProfileRoutes = require('./routes/employees-profile');
const financeRoutes = require('./routes/finance');
const attendanceRoutes = require('./routes/attendance');
const path = require('path');

const app = express();

// Dynamic CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://truerizehireconnectportal.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Test DB connection route
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ message: 'Database connection successful', test: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/candidate-dashboard', candidateDashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees', employeeProfileRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Serve frontend static files correctly
app.use(express.static(path.join(__dirname, '../frontend/.next/static')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// For all other routes, serve the frontend index.html or Next.js page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/.next/server/pages/index.html'));
});

// Validate required SMTP environment variables (optional for development)
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  Skipping SMTP validation for production (optional for registration)');
  // for (const v of ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM']) {
  //   if (!process.env[v]) { throw new Error(`Missing env: ${v}`); }
  // }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Using MySQL database`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
