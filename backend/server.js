require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize dbStatus to disconnected initially
app.set('dbStatus', 'disconnected');

// Use Helmet for security headers
app.use(helmet());

// Prevent NoSQL query injection
app.use(mongoSanitize());

// CORS middleware - Allow all origins for easier local dev testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Rate limiting for auth routes (100 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication requests from this IP, please try again after 15 minutes' }
});

// Basic status check endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    database: app.get('dbStatus'),
    time: new Date().toISOString()
  });
});

// Load routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Database connection logic
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI.includes('<username>') || MONGO_URI.includes('cluster-url')) {
  console.warn('\n======================================================================');
  console.warn('WARNING: Valid MONGO_URI not found in environment variables.');
  console.warn('The server will start in OFFLINE/MOCK mode.');
  console.warn('Configure MONGO_URI in backend/.env to connect to MongoDB Atlas.');
  console.warn('======================================================================\n');
  
  startServer();
} else {
  // Attempt connection but do not let connection errors crash the boot process
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB database connected successfully.');
      app.set('dbStatus', 'connected');
      startServer();
    })
    .catch((err) => {
      console.error('\n======================================================================');
      console.error('ERROR: Failed to connect to MongoDB Atlas database.');
      console.error(err.message);
      console.error('The server will boot in OFFLINE/MOCK mode with simulated data.');
      console.error('Check your connection credentials, network permissions, or password characters.');
      console.error('======================================================================\n');
      
      app.set('dbStatus', 'disconnected');
      startServer();
    });
}

function startServer() {
  // Prevent duplicate listening during tests
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Job Application Tracker backend running on port ${PORT}`);
    });
  }
}

module.exports = app; // For testing
