const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  departmentName: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
