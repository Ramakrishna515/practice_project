const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  shiftName: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  breakDuration: {
    type: Number,
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shift', shiftSchema);
