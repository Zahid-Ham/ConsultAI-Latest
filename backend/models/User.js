const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // **MODIFIED**: Removed the specialization enum to allow more flexibility.
  // This helps prevent validation errors if a new specialization is needed.
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  // **NEW** last active status for chat
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user info without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Index for email queries
userSchema.index({ email: 1 });

// Index for role queries
userSchema.index({ role: 1 });

// Index for googleId queries
userSchema.index({ googleId: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;