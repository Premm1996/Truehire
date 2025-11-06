// Suppress all deprecation warnings including util._extend
process.noDeprecation = true;

// Load environment variables using centralized loader
const { loadEnvironment } = require('./config/envLoader');
loadEnvironment();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const socketService = require('./services/socketService');
const { pool, connectionPromise } = require('./db');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

socketService.init(io);

// Middleware
app.use(cors());
app.use(compression()); // Enable gzip compression for better performance
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));


// Routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/admin-auth');
const employeeRoutes = require('./routes/employees');
const employeesProfileRoutes = require('./routes/employees-profile');
const adminRoutes = require('./routes/admin');
const onboardingRoutes = require('./routes/onboarding');
const attendanceRoutes = require('./routes/attendance');
const financeRoutes = require('./routes/finance');
const notificationRoutes = require('./routes/notifications');
const healthRoutes = require('./routes/health');

// Cron Service
const cronService = require('./utils/cronService');

app.use('/api/auth', authRoutes);
app.use('/api/auth', adminAuthRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees', employeesProfileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', healthRoutes);

// Database connection is now handled in db.js with retry logic
// The server will only start if database connection is successful

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectionPromise;
    logger.info(`Starting server on port ${PORT}...`);

    // Start cron jobs after database connection
    cronService.startAllJobs();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use. Please free the port or change the PORT environment variable.`);
        process.exit(1);
      } else {
        logger.error('Server error:', err);
      }
    });
  } catch (err) {
    logger.error('Failed to start server due to database connection error:', err);
    process.exit(1);
  }
})();
