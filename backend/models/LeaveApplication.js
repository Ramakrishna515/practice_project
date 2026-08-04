const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['Morning', 'Afternoon']
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedDate: Date,
  rejectionReason: String,
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
