const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const JobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role/Job title is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    jobLink: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    salary: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true
    },
    location: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote'
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time'
    },
    history: [StatusHistorySchema]
  },
  {
    timestamps: true
  }
);

// Compound indexes for user queries
JobApplicationSchema.index({ user: 1, status: 1 });
JobApplicationSchema.index({ user: 1, appliedDate: -1 });

// Middleware to initialize history with the initial status on save
JobApplicationSchema.pre('save', function (next) {
  if (this.isNew && this.status) {
    this.history = [{ status: this.status, updatedAt: new Date() }];
  }
  next();
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
