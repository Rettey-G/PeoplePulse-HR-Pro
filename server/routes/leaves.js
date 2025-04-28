const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const Leave = require('../models/Leave');
const User = require('../models/User');

// Get leave balances for an employee
router.get('/:id/balances', auth, authorize(['admin', 'hr']), async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .select('name department gender leaveBalances leaveHistory');
        
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Request leave
router.post('/request', auth, async (req, res) => {
    try {
        const { type, startDate, endDate } = req.body;
        const employee = await Employee.findById(req.employee._id);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Calculate leave duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check if enough balance
        const balance = employee.leaveBalances[type].accrued - employee.leaveBalances[type].used;
        if (balance < duration) {
            return res.status(400).json({ error: 'Insufficient leave balance' });
        }

        // Add to leave history
        employee.leaveHistory.push({
            type,
            startDate,
            endDate,
            status: 'pending'
        });

        await employee.save();

        // Emit real-time update
        req.app.get('io').emit('leaveUpdate', {
            employeeId: employee._id,
            ...employee.toObject()
        });

        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Approve/reject leave
router.patch('/:id/status', auth, authorize(['admin', 'hr']), async (req, res) => {
    try {
        const { leaveId, status } = req.body;
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const leave = employee.leaveHistory.id(leaveId);
        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        if (status === 'approved') {
            // Calculate duration
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            // Update balance
            employee.leaveBalances[leave.type].used += duration;
        }

        leave.status = status;
        await employee.save();

        // Emit real-time update
        req.app.get('io').emit('leaveUpdate', {
            employeeId: employee._id,
            ...employee.toObject()
        });

        res.json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get leave history
router.get('/:id/history', auth, authorize(['admin', 'hr']), async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .select('leaveHistory');
        
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(employee.leaveHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create leave request
router.post('/request', auth, async (req, res) => {
  try {
    const leave = new Leave({
      ...req.body,
      employee: req.user._id
    });

    // Check if user has sufficient leave balance
    const user = await User.findById(req.user._id);
    const leaveType = req.body.type;
    const duration = leave.duration;

    if (user.leaveBalance[leaveType] < duration) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} leave balance` 
      });
    }

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// Update leave status (HR and Admin only)
router.patch('/:id/status', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const { status, rejectionReason } = req.body;
    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    
    if (status === 'rejected') {
      leave.rejectionReason = rejectionReason;
    } else if (status === 'approved') {
      // Update user's leave balance
      const user = await User.findById(leave.employee);
      user.leaveBalance[leave.type] -= leave.duration;
      await user.save();
    }

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
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