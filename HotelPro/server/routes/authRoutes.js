const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const {
  register,
  verifyEmail,
  resendVerificationOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  socialLogin,
  changePassword,
  logout,
  getMe,
  updateProfile
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Sensitive auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 45, // 45 attempts per window
  message: { message: "Too many authentication attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test"
});

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: { message: "Too many verification requests. Please try again later." },
  skip: () => process.env.NODE_ENV === "test"
});

router.post("/register", authLimiter, register);
router.post("/verify-email", otpLimiter, verifyEmail);
router.post("/resend-verification-otp", otpLimiter, resendVerificationOtp);
router.post("/login", authLimiter, login);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-reset-otp", otpLimiter, verifyResetOtp);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/social-login", authLimiter, socialLogin);
router.post("/change-password", protect, changePassword);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
