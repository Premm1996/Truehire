require('dotenv').config();

const express = require('express');
const bodyParser = require('express').json;
const authRoutes = require('./routes/auth');

// Create a minimal express app for testing
const app = express();
app.use(bodyParser());

// Add the auth routes
app.use('/api/auth', authRoutes);

// Test the login route directly
async function testAuthRoute() {
  console.log('Testing auth route directly...');

  // Mock request object
  const mockReq = {
    body: {
      email: 'admin@truerize.com',
      password: 'Tbdam@583225'
    }
  };

  // Mock response object
  const mockRes = {
    status: function(code) {
      console.log('Response status:', code);
      return this;
    },
    json: function(data) {
      console.log('Response data:', data);
      return this;
    },
    send: function(data) {
      console.log('Response send:', data);
      return this;
    }
  };

  // Mock next function
  const mockNext = function(err) {
    if (err) {
      console.error('Next error:', err);
    }
  };

  try {
    // Find the login route handler
    const loginRoute = authRoutes.stack.find(layer =>
      layer.route && layer.route.path === '/login' && layer.route.methods.post
    );

    if (loginRoute) {
      console.log('Found login route, testing...');
      await loginRoute.route.stack[0].handle(mockReq, mockRes, mockNext);
    } else {
      console.log('Login route not found');
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuthRoute();
