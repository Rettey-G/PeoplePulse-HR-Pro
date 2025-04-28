const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all employees (Admin and HR only)
router.get('/', auth, authorize(['admin', 'hr']), async (req, res) => {
    try {
        const employees = await Employee.find().select('-password');
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get employee profile
router.get('/profile', auth, async (req, res) => {
    try {
        const employee = await Employee.findById(req.employee._id).select('-password');
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new employee (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 8);
        const employee = new Employee({
            ...req.body,
            password: hashedPassword
        });
        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update employee (Admin and HR only)
router.patch('/:id', auth, authorize(['admin', 'hr']), async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'role', 'department', 'manager'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        updates.forEach(update => employee[update] = req.body[update]);
        await employee.save();
        res.json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete employee (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 