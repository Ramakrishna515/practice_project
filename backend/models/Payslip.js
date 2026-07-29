const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  paymentDate: Date,
  salaryStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryStructure',
    required: true
  },
  workingDays: {
    type: Number,
    required: true
  },
  presentDays: {
    type: Number,
    required: true
  },
  absentDays: {
    type: Number,
    default: 0
  },
  leaveDays: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  overtimeAmount: {
    type: Number,
    default: 0
  },
  grossEarnings: {
    type: Number,
    required: true
  },
  totalDeductions: {
    type: Number,
    required: true
  },
  netPay: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Processed', 'Paid'],
    default: 'Draft'
  },
  paymentMode: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque']
  },
  remarks: String,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index
payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
