const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Health check route
router.get('/health', async (req, res) => {
  try {
    // Simple query to check database connection
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Test database connection route
router.get('/test-db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

module.exports = router;
