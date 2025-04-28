const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Employee = require('../models/Employee');
const User = require('../models/User');

// Get all employees (admin and HR only)
router.get('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('user', 'firstName lastName email role')
      .populate('supervisor', 'firstName lastName');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'firstName lastName email role')
      .populate('supervisor', 'firstName lastName');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user has permission to view this employee
    if (req.user.role === 'employee' && employee.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new employee (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { user, ...employeeData } = req.body;

    // Create user first
    const newUser = new User(user);
    await newUser.save();

    // Create employee with user reference
    const employee = new Employee({
      ...employeeData,
      user: newUser._id
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee (admin and HR only)
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { user, ...employeeData } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update user data if provided
    if (user) {
      await User.findByIdAndUpdate(employee.user, user);
    }

    // Update employee data
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      employeeData,
      { new: true }
    ).populate('user', 'firstName lastName email role');

    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete user
    await User.findByIdAndUpdate(employee.user, { isActive: false });

    // Update employee status
    await Employee.findByIdAndUpdate(req.params.id, { status: 'terminated' });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 