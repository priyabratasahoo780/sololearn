const express = require('express');
const {
  signup,
  login,
  logout,
  getMe,
// ... existing imports
  refresh,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  resendOtp,
  updateDetails
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.put('/updatedetails', protect, updateDetails);
router.post('/signup', signup);
router.post('/login', login);
// ... logout ...
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/refresh', refresh);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
