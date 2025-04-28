const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  empNo: {
    type: String,
    required: true,
    unique: true
  },
  employeeName: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  mobileNumber: {
    type: String
  },
  designation: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  workSite: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    required: true
  },
  salaryMVR: {
    type: Number,
    required: true
  },
  salaryUSD: {
    type: Number,
    required: true
  },
  accountMVR: {
    type: String,
    required: true
  },
  accountUSD: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave'],
    default: 'Active'
  }
}, {
  timestamps: true
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 