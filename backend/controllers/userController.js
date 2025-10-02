// backend/controllers/userController.js

const User = require('../models/User');
const cloudinary = require('../cloudinary');

const getUserProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.file) {
      if (user.profilePicture && user.profilePicture.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      }
      user.profilePicture = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.age = req.body.age || user.age;
    user.sex = req.body.sex || user.sex;

    // ===== ADD THIS LOGIC FOR DOCTORS =====
    if (user.role === 'doctor') {
      user.specialization = req.body.specialization || user.specialization;
    }
    // =======================================

    const updatedUser = await user.save();

    res.json(updatedUser.toJSON());

  } catch (error) {
    // Check for Mongoose validation error specifically
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};