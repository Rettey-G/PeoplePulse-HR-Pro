const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const { Leave, LeaveBalance } = require('../models/Leave');
const User = require('../models/User');

// Get leave balances
router.get('/:id/balances', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user has permission to view these balances
    if (req.user.role === 'employee' && employee.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const balances = await LeaveBalance.findOne({ employee: req.params.id });
    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request leave
router.post('/request', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, reason, attachments } = req.body;
    
    // Calculate duration
    const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

    // Get employee
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check leave balance
    const balance = await LeaveBalance.findOne({ employee: employee._id });
    if (!balance) {
      return res.status(400).json({ message: 'Leave balance not found' });
    }

    const availableBalance = balance[type].accrued - balance[type].used;
    if (availableBalance < duration) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    // Create leave request
    const leave = new Leave({
      employee: employee._id,
      type,
      startDate,
      endDate,
      duration,
      reason,
      attachments
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update leave status (admin and HR only)
router.patch('/:id/status', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Update leave status
    leave.status = status;
    if (status === 'approved') {
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();
      
      // Update leave balance
      const balance = await LeaveBalance.findOne({ employee: leave.employee });
      balance[leave.type].used += leave.duration;
      await balance.save();
    } else if (status === 'rejected') {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get leave history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user has permission to view this history
    if (req.user.role === 'employee' && employee.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const leaves = await Leave.find({ employee: req.params.id })
      .sort('-createdAt')
      .populate('approvedBy', 'firstName lastName');

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all leave requests (HR and Admin only)
router.get('/', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's leave requests
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate('approvedBy', 'firstName lastName');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave balances
router.get('/balances', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.leaveBalance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 