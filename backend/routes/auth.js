const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// In-memory users database for offline mock mode
const MOCK_USERS = [
  { _id: 'mock_user_id', email: 'test@example.com', password: 'password123' }
];

// Helper to sign JWT
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_testing';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

// @route   POST /api/auth/signup
// @desc    Register a user & get token (supports offline mock database mode)
// @access  Public
router.post(
  '/signup',
  [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Mock db check for offline user creation
      if (req.app.get('dbStatus') === 'disconnected') {
        const existingUser = MOCK_USERS.find(u => u.email === email);
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const mockNewUser = {
          _id: 'mock_user_' + Date.now(),
          email,
          password
        };
        MOCK_USERS.push(mockNewUser);

        const token = generateToken(mockNewUser._id);
        return res.status(201).json({
          token,
          user: {
            id: mockNewUser._id,
            email: mockNewUser.email
          }
        });
      }

      // Real database execution
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      user = new User({ email, password });
      await user.save();

      const token = generateToken(user._id);
      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (supports offline mock validation mode)
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Mock db validation checks
      if (req.app.get('dbStatus') === 'disconnected') {
        const existingUser = MOCK_USERS.find(u => u.email === email);
        if (!existingUser) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        if (existingUser.password !== password) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(existingUser._id);
        return res.status(200).json({
          token,
          user: {
            id: existingUser._id,
            email: existingUser.email
          }
        });
      }

      // Real database check
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

module.exports = router;
