require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const employees = [
  {
    empNo: 'FEM001',
    email: 'ahmed.sinaz@example.com',
    password: 'password123',
    firstName: 'Ahmed',
    lastName: 'Sinaz',
    idNumber: 'A132309',
    gender: 'Male',
    nationality: 'Maldivian',
    dateOfBirth: new Date('1989-10-22'),
    mobileNumber: '9991960',
    designation: 'Managing Director',
    department: 'Admin',
    workSite: 'Office',
    joinDate: new Date('2011-03-21'),
    salaryMVR: 2000,
    salaryUSD: 2000,
    accountMVR: '7705328542101',
    accountUSD: '7705328542102'
  },
  // Add more employees here...
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Insert new data
    for (const employee of employees) {
      const user = new User(employee);
      await user.save();
      console.log(`Added employee: ${employee.empNo}`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 