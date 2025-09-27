const { User } = require('../models');

// Get all unverified doctors
const getUnverifiedDoctors = async (req, res) => {
  try {
    const unverifiedDoctors = await User.find({
      role: 'doctor',
      isVerified: false
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Unverified doctors retrieved successfully',
      count: unverifiedDoctors.length,
      data: unverifiedDoctors
    });
  } catch (error) {
    console.error('Get unverified doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Verify a doctor by ID
const verifyDoctor = async (req, res) => {
  try {
    const { doctorId, id } = req.params;
    const doctorIdToUse = doctorId || id;

    // Check if doctor exists and is unverified
    const doctor = await User.findOne({
      _id: doctorIdToUse,
      role: 'doctor',
      isVerified: false
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or already verified'
      });
    }

    // Update doctor verification status
    doctor.isVerified = true;
    await doctor.save();

    // Return updated doctor data without password
    const updatedDoctor = doctor.toJSON();

    res.status(200).json({
      success: true,
      message: 'Doctor verified successfully',
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Verify doctor error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get all doctors (verified and unverified)
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor'
    }).select('-password');

    const verifiedCount = doctors.filter(doc => doc.isVerified).length;
    const unverifiedCount = doctors.filter(doc => !doc.isVerified).length;

    res.status(200).json({
      success: true,
      message: 'Doctors retrieved successfully',
      data: {
        doctors,
        stats: {
          total: doctors.length,
          verified: verifiedCount,
          unverified: unverifiedCount
        }
      }
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// **NEW** Get all verified doctors
const getVerifiedDoctors = async (req, res) => {
    try {
        const verifiedDoctors = await User.find({
            role: 'doctor',
            isVerified: true
        }).select('-password');

        // Check if any verified doctors were found
        if (!verifiedDoctors || verifiedDoctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No verified doctors found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verified doctors retrieved successfully',
            count: verifiedDoctors.length,
            data: verifiedDoctors
        });
    } catch (error) {
        console.error('Get verified doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};

module.exports = {
  getUnverifiedDoctors,
  verifyDoctor,
  getAllDoctors,
  getVerifiedDoctors,
};