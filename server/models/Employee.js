const mongoose = require('mongoose');

const leaveHistorySchema = new mongoose.Schema({
    type: {
        type: String,
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
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
});

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'hr', 'employee'],
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    hireDate: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    leaveBalances: {
        annual: {
            accrued: { type: Number, default: 0 },
            used: { type: Number, default: 0 }
        },
        emergency: {
            accrued: { type: Number, default: 0 },
            used: { type: Number, default: 0 }
        },
        sick: {
            accrued: { type: Number, default: 0 },
            used: { type: Number, default: 0 }
        },
        parental: {
            accrued: { type: Number, default: 0 },
            used: { type: Number, default: 0 }
        },
        familyCare: {
            accrued: { type: Number, default: 0 },
            used: { type: Number, default: 0 }
        }
    },
    leaveHistory: [leaveHistorySchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema); 