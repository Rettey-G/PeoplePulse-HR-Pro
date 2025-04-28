const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    enum: ['annual', 'sick', 'emergency', 'family-care', 'parental'],
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
  duration: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  attachments: [{
    name: String,
    url: String,
    uploadDate: Date
  }]
}, {
  timestamps: true
});

// Leave balance schema
const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  annual: {
    accrued: { type: Number, default: 0 },
    used: { type: Number, default: 0 }
  },
  sick: {
    accrued: { type: Number, default: 0 },
    used: { type: Number, default: 0 }
  },
  emergency: {
    accrued: { type: Number, default: 0 },
    used: { type: Number, default: 0 }
  },
  familyCare: {
    accrued: { type: Number, default: 0 },
    used: { type: Number, default: 0 }
  },
  parental: {
    maternity: { type: Number, default: 90 },
    paternity: { type: Number, default: 14 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const Leave = mongoose.model('Leave', leaveSchema);
const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

module.exports = { Leave, LeaveBalance }; 