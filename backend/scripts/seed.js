require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI || MONGO_URI.includes('<username>')) {
    console.error('Error: Please configure a valid MONGO_URI in your backend/.env file before seeding.');
    process.exit(1);
  }

  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error('Error: Please provide the email address of the user to seed applications for.');
    console.log('Usage: node scripts/seed.js user@example.com');
    process.exit(1);
  }

  const email = emailArg.toLowerCase().trim();

  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected.');

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`Error: User with email "${email}" not found. Please register this user first via the signup page.`);
      process.exit(1);
    }

    console.log(`Clearing existing applications for user ${email}...`);
    await JobApplication.deleteMany({ user: user._id });

    const seedApplications = [
      {
        user: user._id,
        company: 'Stripe',
        role: 'Frontend Architect',
        status: 'Interview',
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        jobLink: 'https://stripe.com/jobs',
        notes: 'Recruiter call went exceptionally well. Technical panel round scheduled for next Wednesday.',
        salary: 145000,
        currency: 'USD',
        location: 'Remote',
        jobType: 'Full-time',
        history: [
          { status: 'Applied', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { status: 'Interview', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        user: user._id,
        company: 'Google',
        role: 'Software Engineer III',
        status: 'Applied',
        appliedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        jobLink: 'https://careers.google.com',
        notes: 'Applied online with internal employee referral.',
        salary: 168000,
        currency: 'USD',
        location: 'Hybrid',
        jobType: 'Full-time',
        history: [
          { status: 'Applied', updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        user: user._id,
        company: 'Vercel',
        role: 'React Developer Advocate',
        status: 'Offer',
        appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        jobLink: 'https://vercel.com/careers',
        notes: 'Received written offer! Base salary package is negotiable. Reviewing benefit details.',
        salary: 155000,
        currency: 'USD',
        location: 'Remote',
        jobType: 'Full-time',
        history: [
          { status: 'Applied', updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { status: 'Interview', updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
          { status: 'Offer', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        user: user._id,
        company: 'Netflix',
        role: 'Senior UI Engineer',
        status: 'Rejected',
        appliedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        jobLink: 'https://jobs.netflix.com',
        notes: 'Resume screening rejection due to headcount capacity limit. Keeping contact details for next season.',
        salary: 190000,
        currency: 'USD',
        location: 'On-site',
        jobType: 'Full-time',
        history: [
          { status: 'Applied', updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
          { status: 'Rejected', updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }
        ]
      }
    ];

    console.log('Inserting seed applications...');
    await JobApplication.insertMany(seedApplications);
    console.log('Database successfully seeded with realistic entries!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
