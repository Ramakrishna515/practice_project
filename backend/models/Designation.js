const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  designationCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  designationName: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation'
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Designation', designationSchema);
