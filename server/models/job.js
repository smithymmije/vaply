// models/job.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'freelance', 'contract'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'not-specified'],
    default: 'not-specified'
  },
  salary: {
    type: String,
    trim: true,
    default: ''
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);