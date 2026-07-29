const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  effectiveFrom: {
    type: Date,
    required: true
  },
  earnings: {
    basicSalary: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    otherAllowances: [{
      name: String,
      amount: Number
    }]
  },
  deductions: {
    providentFund: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    otherDeductions: [{
      name: String,
      amount: Number
    }]
  },
  grossSalary: {
    type: Number,
    required: true
  },
  totalDeductions: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
