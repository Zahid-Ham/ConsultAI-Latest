const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@consultai.com',
  password: 'admin123',  // Plain password, will be hashed by model
  role: 'admin',
  isVerified: true
};

// Function to create admin user
async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Do NOT hash password here!
    // Create new admin user
    const admin = new User(adminData);
    
    // Save admin to database
    await admin.save();
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();