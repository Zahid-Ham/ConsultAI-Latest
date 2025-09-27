const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding test users'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Test users data
const testUsers = [
  {
    name: 'Test Doctor',
    email: 'doctor@consultai.com',
    password: 'doctor123',  // This will be hashed before saving
    role: 'doctor',
    isVerified: true
  },
  {
    name: 'Test Patient',
    email: 'patient@consultai.com',
    password: 'patient123',  // This will be hashed before saving
    role: 'patient',
    isVerified: true
  },
  {
    name: 'Unverified Doctor',
    email: 'unverified@consultai.com',
    password: 'unverified123',  // This will be hashed before saving
    role: 'doctor',
    isVerified: false
  }
];

// Function to create test users
async function seedTestUsers() {
  try {
    // Create users if they don't exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists`);
        continue;
      }
      
      // Hash password
      // const salt = await bcrypt.genSalt(12);
      // const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create new user with hashed password
      const user = new User(userData);
      
      // Save user to database
      await user.save();
      
      console.log(`User ${userData.email} created successfully`);
    }
    
    console.log('Test users seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTestUsers();