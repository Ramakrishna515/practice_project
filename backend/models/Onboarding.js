const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  onboardingStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  completionDate: Date,
  documents: [{
    documentName: { type: String, required: true },
    isRequired: { type: Boolean, default: true },
    isSubmitted: { type: Boolean, default: false },
    submittedDate: Date,
    documentUrl: String
  }],
  tasks: [{
    taskName: { type: String, required: true },
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    },
    completedDate: Date,
    remarks: String
  }],
  trainings: [{
    trainingName: { type: String, required: true },
    trainer: String,
    scheduledDate: Date,
    duration: Number,
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    },
    completionDate: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Onboarding', onboardingSchema);
