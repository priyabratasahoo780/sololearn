const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');
const Otp = require('../models/Otp.model');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateCertificate = require('../utils/generateCertificate');
const { sendOtpEmail, sendCertificateEmail, sendResetEmail } = require('../utils/sendEmail');

// Helper to check and update streak
const updateStreak = async (user) => {
  const now = new Date();
  const lastLogin = new Date(user.lastLogin || 0); // Handle missing lastLogin
  
  // Reset time to midnight for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (today === lastDate) {
    // Already logged in today, do nothing
    return false;
  } else if (today - lastDate === oneDay) {
    // Consecutive day
    user.streak = (user.streak || 0) + 1;
    user.lastLogin = now;
    await user.save();
    return true;
  } else {
    // Streak broken (or first login)
    if (user.streak > 0 && today - lastDate > oneDay) {
        user.streak = 1;
    } else if (!user.streak) {
        user.streak = 1;
    }
    user.lastLogin = now;
    await user.save();
    return true;
  }
};

// Generate tokens and send response
const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken(); // Ensure User model has this method or implement it

  // Update streak
  await updateStreak(user);

  // Create cookie options
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching refresh token
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', refreshToken, options)
    .json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        coins: user.coins,
        totalPoints: user.totalPoints,
        badges: user.badges
      }
    });
};

// @desc    Send OTP for Login
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, 'Please provide an email'));
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, { 
    upperCaseAlphabets: false, 
    specialChars: false,
    lowerCaseAlphabets: false
  });

  // Hash OTP
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);

  // Create OTP document
  await Otp.create({
    email,
    otp: hashedOtp
  });

  // Send Email (Mock or Real)
  let emailSent = false;
  try {
    const result = await sendOtpEmail(email, otp);
    emailSent = result?.success || false;
    if (!emailSent) {
      console.warn('⚠️ Email delivery failed:', result?.error);
    }
  } catch (err) {
    console.error('Email service crash:', err.message);
  }

  // FORCE LOG OTP FOR USER VISIBILITY
  console.log('\n\n==================================================');
  console.log('🔑 OTP REQUESTED FOR:', email);
  console.log('🔑 YOUR LOGIN OTP IS:', otp);
  console.log('🔑 EMAIL STATUS:', emailSent ? 'SENT ✅' : 'FAILED ❌ (Using Mock Mode)');
  console.log('==================================================\n\n');

  res.status(200).json({
    success: true,
    message: emailSent ? `OTP sent to ${email}` : `OTP ready (Email service unavailable)`,
    emailSent,
    otp: otp // Return for dev/mock mode
  });
});

// @desc    Verify OTP and Login/Signup
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ApiError(400, 'Please provide email and OTP'));
  }

  // Find latest OTP
  const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return next(new ApiError(400, 'Invalid or expired OTP'));
  }

  // Verify OTP
  const isMatch = await bcrypt.compare(otp, otpRecord.otp);
  if (!isMatch) {
    return next(new ApiError(400, 'Invalid OTP'));
  }

  // Check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    // Create new user
    // Generate a random password since it's required by schema
    const randomPassword = crypto.randomBytes(10).toString('hex');
    // Use provided name or default to email prefix
    const userName = req.body.name || email.split('@')[0];

    user = await User.create({
      name: userName,
      email,
      password: randomPassword
    });
  }

  // Delete used OTPs for this email
  await Otp.deleteMany({ email });

  // Generate Certificate
  try {
    const certificateId = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    // Store certificate in DB
    const Certificate = require('../models/Certificate.model');
    // Check if certificate already exists for "Authentication"
    const existingCert = await Certificate.findOne({
      user: user._id,
      category: 'Authentication'
    });

    if (!existingCert) {
      await Certificate.create({
        user: user._id,
        title: 'Authentication Success',
        category: 'Authentication',
        scorePercent: 100,
        certificateCode: certificateId
      });

      const pdfBuffer = await generateCertificate(user, 'Authentication Success', certificateId);
      
      // Send Certificate Email
      await sendCertificateEmail(user, pdfBuffer);
    }
    
  } catch (err) {
    console.error('Certificate generation/sending failed:', err);
    // Don't fail login if certificate fails
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = exports.sendOtp; // Reuse sendOtp logic

// @desc    Register user (Legacy/Fallback)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ApiError(400, 'User already exists'));
  }

  const user = await User.create({
    name,
    email,
    password
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user (Legacy/Fallback)
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, 'Please provide an email and password'));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  await updateStreak(user);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (Cookie based)
exports.refresh = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.token;

  if (!refreshToken) {
    return next(new ApiError(401, 'No refresh token provided'));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    const accessToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token: accessToken
    });
  } catch (err) {
    return next(new ApiError(401, 'Invalid refresh token'));
  }
});

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError(404, 'There is no user with that email'));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  try {
    await sendResetEmail(user, resetUrl);

    res.status(200).json({
      success: true,
      data: 'Email sent'
    });
  } catch (err) {
    console.log('❌ Email service failed, falling back to manual mock log:', err.message);
    
    // FAIL-SAFE: If email crashes, log the link manually so user can still proceed
    console.log('---------------------------------------------------');
    console.log(`📧 [MANUAL FALLBACK] Password Reset Link:`);
    console.log(resetUrl);
    console.log('---------------------------------------------------');

    // Return success to frontend so user sees "Check Email" screen
    res.status(200).json({
      success: true,
      data: 'Email sent (Mock Mode)'
    });
  }
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const crypto = require('crypto');
  
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ApiError(400, 'Invalid token'));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});
