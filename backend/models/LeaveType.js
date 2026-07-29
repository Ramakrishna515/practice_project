const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  leaveTypeName: {
    type: String,
    required: true,
    unique: true
  },
  leaveCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  maxDaysPerYear: {
    type: Number,
    required: true
  },
  carryForward: {
    type: Boolean,
    default: false
  },
  maxCarryForwardDays: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
