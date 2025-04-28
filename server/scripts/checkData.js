const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/peoplepulse', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\nCollections in database:');
  collections.forEach(collection => {
    console.log(`- ${collection.name}`);
  });

  // Check users
  console.log('\nUsers:');
  const users = await User.find();
  users.forEach(user => {
    console.log(`Username: ${user.username}, Role: ${user.role}`);
  });

  // Check employees
  console.log('\nEmployees:');
  const employees = await Employee.find();
  employees.forEach(emp => {
    console.log(`Employee No: ${emp.empNo}, Name: ${emp.employeeName}`);
  });

  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 