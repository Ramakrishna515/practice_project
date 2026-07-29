const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed']
    },
    bloodGroup: String,
    profilePhoto: String
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: { type: String, required: true },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    currentAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    permanentAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    }
  },
  employmentInfo: {
    joiningDate: { type: Date, required: true },
    employmentType: {
      type: String,
      enum: ['Permanent', 'Contract', 'Intern'],
      default: 'Permanent'
    },
    probationPeriod: Number,
    confirmationDate: Date,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designation'
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    workLocation: String,
    employmentStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Resigned', 'Terminated'],
      default: 'Active'
    }
  },
  documents: [{
    documentType: String,
    documentName: String,
    documentUrl: String,
    uploadedDate: { type: Date, default: Date.now }
  }],
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate employee ID
employeeSchema.pre('save', async function(next) {
  if (!this.isNew) return next();

  const count = await mongoose.model('Employee').countDocuments();
  this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
