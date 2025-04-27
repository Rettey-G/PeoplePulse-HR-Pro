const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
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
  year: {
    type: Number,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  usedDays: {
    type: Number,
    default: 0
  },
  remainingDays: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for unique employee-leaveType-year combination
leaveBalanceSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema); 