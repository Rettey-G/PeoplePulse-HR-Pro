const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all employees (HR and Admin only)
router.get('/', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const employees = await User.find()
      .select('-password -__v')
      .sort('empNo');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password -__v');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Only HR and Admin can view other employees' details
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && 
        employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new employee (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const employee = new User(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee (Admin only)
router.patch('/:id', auth, authorize('admin'), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'email', 'firstName', 'lastName', 'idNumber', 'gender',
    'nationality', 'dateOfBirth', 'mobileNumber', 'designation',
    'department', 'workSite', 'salaryMVR', 'salaryUSD',
    'accountMVR', 'accountUSD'
  ];

  const isValidOperation = updates.every(update => 
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates!' });
  }

  try {
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    updates.forEach(update => employee[update] = req.body[update]);
    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 