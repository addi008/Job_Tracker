const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const JobApplication = require('../models/JobApplication');

// Mock data to return if DB is disconnected
let MOCK_APPLICATIONS = [
  {
    _id: 'mock_app_1',
    company: 'Stripe',
    role: 'Frontend Engineer',
    status: 'Interview',
    appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    jobLink: 'https://stripe.com/jobs',
    notes: 'Recruiter call went well. Technical interview scheduled for next week.',
    user: 'mock_user_id',
    salary: 135000,
    currency: 'USD',
    location: 'Remote',
    jobType: 'Full-time',
    history: [
      { status: 'Applied', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Interview', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    _id: 'mock_app_2',
    company: 'Google',
    role: 'Software Engineer',
    status: 'Applied',
    appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    jobLink: 'https://careers.google.com',
    notes: 'Applied online via referral.',
    user: 'mock_user_id',
    salary: 160000,
    currency: 'USD',
    location: 'Hybrid',
    jobType: 'Full-time',
    history: [
      { status: 'Applied', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    _id: 'mock_app_3',
    company: 'Airbnb',
    role: 'React Developer',
    status: 'Offer',
    appliedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    jobLink: 'https://airbnb.com/careers',
    notes: 'Received written offer. Reviewing benefits details.',
    user: 'mock_user_id',
    salary: 145000,
    currency: 'USD',
    location: 'Remote',
    jobType: 'Contract',
    history: [
      { status: 'Applied', updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Interview', updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Offer', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    _id: 'mock_app_4',
    company: 'Netflix',
    role: 'Senior UI Engineer',
    status: 'Rejected',
    appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    jobLink: 'https://jobs.netflix.com',
    notes: 'Resume screen rejection. Keep applying.',
    user: 'mock_user_id',
    salary: 185000,
    currency: 'USD',
    location: 'On-site',
    jobType: 'Full-time',
    history: [
      { status: 'Applied', updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Rejected', updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }
];

// Helper to check DB status
const checkDbConnection = (req, res, next) => {
  if (req.app.get('dbStatus') === 'disconnected') {
    if (req.user && req.user.id === 'mock_user_id') {
      return next();
    }
    return res.status(503).json({ message: 'Database connection is currently offline. Please configure MONGO_URI.' });
  }
  next();
};

// @route   GET /api/applications
// @desc    Get all applications of user (supports search, sort, and status filter)
// @access  Private
router.get('/', auth, checkDbConnection, async (req, res) => {
  try {
    // Return mock data if offline
    if (req.app.get('dbStatus') === 'disconnected') {
      let apps = MOCK_APPLICATIONS.filter(app => app.user === req.user.id);
      
      // Filter by status
      if (req.query.status && req.query.status !== 'All') {
        apps = apps.filter(app => app.status === req.query.status);
      }

      // Keyword search
      if (req.query.search) {
        const queryStr = req.query.search.toLowerCase();
        apps = apps.filter(app => 
          app.company.toLowerCase().includes(queryStr) || 
          app.role.toLowerCase().includes(queryStr)
        );
      }

      // Sort
      if (req.query.sort) {
        const [field, order] = req.query.sort.split('_');
        apps.sort((a, b) => {
          let valA = a[field];
          let valB = b[field];
          if (field === 'appliedDate') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (valA < valB) return order === 'asc' ? -1 : 1;
          if (valA > valB) return order === 'asc' ? 1 : -1;
          return 0;
        });
      } else {
        // default sorting (appliedDate desc)
        apps.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
      }

      return res.status(200).json(apps);
    }

    const query = { user: req.user.id };
    
    // Status Filter
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    // Search query regex
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { company: searchRegex },
        { role: searchRegex }
      ];
    }

    // Build sorting config
    let sortBy = { appliedDate: -1, createdAt: -1 };
    if (req.query.sort) {
      const [field, order] = req.query.sort.split('_');
      const sortOrder = order === 'asc' ? 1 : -1;
      sortBy = { [field]: sortOrder };
    }

    const applications = await JobApplication.find(query).sort(sortBy);
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error retrieving applications' });
  }
});

// @route   GET /api/applications/stats/summary
// @desc    Get stats count for each status
// @access  Private
router.get('/stats/summary', auth, checkDbConnection, async (req, res) => {
  try {
    if (req.app.get('dbStatus') === 'disconnected') {
      const stats = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
      MOCK_APPLICATIONS.filter(app => app.user === req.user.id).forEach(app => {
        if (stats[app.status] !== undefined) {
          stats[app.status]++;
        }
      });
      return res.status(200).json(stats);
    }

    const statuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
    const counts = await Promise.all(
      statuses.map(status =>
        JobApplication.countDocuments({ user: req.user.id, status })
      )
    );

    const summary = {};
    statuses.forEach((status, idx) => {
      summary[status] = counts[idx];
    });

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error generating summary stats:', error);
    res.status(500).json({ message: 'Server error generating summary statistics' });
  }
});

// @route   POST /api/applications
// @desc    Add a new application
// @access  Private
router.post(
  '/',
  auth,
  checkDbConnection,
  [
    check('company', 'Company name is required').notEmpty().trim(),
    check('role', 'Role is required').notEmpty().trim(),
    check('status', 'Invalid status').optional().isIn(['Applied', 'Interview', 'Offer', 'Rejected']),
    check('location', 'Invalid location').optional().isIn(['Remote', 'Hybrid', 'On-site']),
    check('jobType', 'Invalid job type').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company, role, status, appliedDate, jobLink, notes, salary, currency, location, jobType } = req.body;

    // Mock handling
    if (req.app.get('dbStatus') === 'disconnected') {
      const selectedStatus = status || 'Applied';
      const mockNew = {
        _id: 'mock_app_' + Date.now(),
        company,
        role,
        status: selectedStatus,
        appliedDate: appliedDate || new Date().toISOString(),
        jobLink: jobLink || '',
        notes: notes || '',
        salary: salary ? Number(salary) : null,
        currency: currency || 'USD',
        location: location || 'Remote',
        jobType: jobType || 'Full-time',
        user: req.user.id,
        history: [{ status: selectedStatus, updatedAt: new Date().toISOString() }]
      };
      MOCK_APPLICATIONS.push(mockNew);
      return res.status(201).json(mockNew);
    }

    try {
      const newApplication = new JobApplication({
        user: req.user.id,
        company,
        role,
        status: status || 'Applied',
        appliedDate: appliedDate || new Date(),
        jobLink: jobLink || '',
        notes: notes || '',
        salary: salary ? Number(salary) : null,
        currency: currency || 'USD',
        location: location || 'Remote',
        jobType: jobType || 'Full-time'
      });

      const application = await newApplication.save();
      res.status(201).json(application);
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ message: 'Server error adding job application' });
    }
  }
);

// @route   PUT /api/applications/:id
// @desc    Update an application (updates history if status changed)
// @access  Private
router.put(
  '/:id',
  auth,
  checkDbConnection,
  [
    check('company', 'Company name is required').optional().notEmpty().trim(),
    check('role', 'Role is required').optional().notEmpty().trim(),
    check('status', 'Invalid status').optional().isIn(['Applied', 'Interview', 'Offer', 'Rejected']),
    check('location', 'Invalid location').optional().isIn(['Remote', 'Hybrid', 'On-site']),
    check('jobType', 'Invalid job type').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company, role, status, appliedDate, jobLink, notes, salary, currency, location, jobType } = req.body;

    // Mock handling
    if (req.app.get('dbStatus') === 'disconnected') {
      const idx = MOCK_APPLICATIONS.findIndex(app => app._id === req.params.id && app.user === req.user.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Application not found' });
      }

      const existingApp = MOCK_APPLICATIONS[idx];
      const updatedHistory = [...existingApp.history];
      
      if (status !== undefined && status !== existingApp.status) {
        updatedHistory.push({ status, updatedAt: new Date().toISOString() });
      }

      MOCK_APPLICATIONS[idx] = {
        ...existingApp,
        company: company !== undefined ? company : existingApp.company,
        role: role !== undefined ? role : existingApp.role,
        status: status !== undefined ? status : existingApp.status,
        appliedDate: appliedDate !== undefined ? appliedDate : existingApp.appliedDate,
        jobLink: jobLink !== undefined ? jobLink : existingApp.jobLink,
        notes: notes !== undefined ? notes : existingApp.notes,
        salary: salary !== undefined ? (salary ? Number(salary) : null) : existingApp.salary,
        currency: currency !== undefined ? currency : existingApp.currency,
        location: location !== undefined ? location : existingApp.location,
        jobType: jobType !== undefined ? jobType : existingApp.jobType,
        history: updatedHistory
      };
      
      return res.status(200).json(MOCK_APPLICATIONS[idx]);
    }

    try {
      let application = await JobApplication.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Check ownership
      if (application.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized to update this application' });
      }

      // Set fields
      if (company !== undefined) application.company = company;
      if (role !== undefined) application.role = role;
      if (appliedDate !== undefined) application.appliedDate = appliedDate;
      if (jobLink !== undefined) application.jobLink = jobLink;
      if (notes !== undefined) application.notes = notes;
      if (salary !== undefined) application.salary = salary ? Number(salary) : null;
      if (currency !== undefined) application.currency = currency;
      if (location !== undefined) application.location = location;
      if (jobType !== undefined) application.jobType = jobType;

      // Handle status and log history
      if (status !== undefined && status !== application.status) {
        application.history.push({ status, updatedAt: new Date() });
        application.status = status;
      }

      await application.save();
      res.status(200).json(application);
    } catch (error) {
      console.error('Error updating application:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Application not found' });
      }
      res.status(500).json({ message: 'Server error updating application' });
    }
  }
);

// @route   DELETE /api/applications/:id
// @desc    Delete an application
// @access  Private
router.delete('/:id', auth, checkDbConnection, async (req, res) => {
  // Mock handling
  if (req.app.get('dbStatus') === 'disconnected') {
    const idx = MOCK_APPLICATIONS.findIndex(app => app._id === req.params.id && app.user === req.user.id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Application not found' });
    }
    MOCK_APPLICATIONS.splice(idx, 1);
    return res.status(200).json({ message: 'Application removed (Mock)' });
  }

  try {
    let application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check ownership
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to remove this application' });
    }

    await JobApplication.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Application removed' });
  } catch (error) {
    console.error('Error deleting application:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(500).json({ message: 'Server error deleting application' });
  }
});

module.exports = router;
