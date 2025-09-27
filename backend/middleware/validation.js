const validateRegistration = (req, res, next) => {
  const { name, email, password, role, specialization } = req.body;

  // Check required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address'
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Validate name length
  if (name.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name cannot be more than 100 characters'
    });
  }

  // Validate role if provided
  if (role && !['patient', 'doctor', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be one of: patient, doctor, admin'
    });
  }
  
  // 👈 New validation: Check for specialization if the role is 'doctor'
  if (role === 'doctor' && !specialization) {
    return res.status(400).json({
      success: false,
      message: 'Specialization is required for doctors.'
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address'
    });
  }

  // Validate password is not empty
  if (password.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Password cannot be empty'
    });
  }

  next();
};

const validateObjectId = (req, res, next) => {
  const { doctorId, id } = req.params;
  const objectId = doctorId || id;
  
  // Check if objectId is a valid MongoDB ObjectId
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(objectId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateObjectId
};