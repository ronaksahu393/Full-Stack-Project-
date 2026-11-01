const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  generateOtp,
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
  sendPasswordResetSuccessEmail
} = require("../services/emailService");

const generateToken = (id, rememberMe = false) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing.");
  }
  return jwt.sign({ id }, secret, {
    algorithm: "HS256",
    expiresIn: rememberMe ? "30d" : "7d"
  });
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields (name, email, password)." });
    }

    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({ message: "Name must be between 2 and 80 characters." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Passkey must be at least 6 characters in length." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : "";
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const exists = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (exists) {
        return res.status(400).json({ message: "An account with this email address is already registered." });
      }

      const assignedRole = req.body.role === "customer" ? "customer" : "guest";
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: `user_${Date.now()}`,
        name: cleanName,
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        status: "active",
        phone: cleanPhone,
        membership: "Gold Atelier Member",
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        isEmailVerified: true,
        emailVerificationOtp: null,
        emailVerificationExpires: null,
        createdAt: new Date().toISOString()
      };
      store.users.push(newUser);

      const token = generateToken(newUser._id);
      const userSafe = { ...newUser };
      delete userSafe.password;
      delete userSafe.emailVerificationOtp;

      return res.status(201).json({
        token,
        user: userSafe,
        requireVerification: false,
        message: "Registration successful. Welcome to HotelPro!"
      });
    }

    // Mongoose path
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email address is already registered." });
    }

    const assignedRole = req.body.role === "customer" ? "customer" : "guest";

    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      password,
      phone: cleanPhone,
      role: assignedRole,
      status: "active",
      membership: "Gold Atelier Member",
      isEmailVerified: true,
      emailVerificationOtp: null,
      emailVerificationExpires: null,
      lastOtpSentAt: new Date()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membership: user.membership,
        isEmailVerified: true,
        avatar: user.avatar
      },
      requireVerification: false,
      message: "Registration successful. Welcome to HotelPro!"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify email address using 6-digit OTP
 * @route   POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide both email and verification code." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(404).json({ message: "User account not found." });
      }

      if (user.isEmailVerified) {
        return res.json({ success: true, message: "Your email address is already verified." });
      }

      if (user.emailVerificationOtp !== cleanOtp) {
        return res.status(400).json({ message: "Invalid verification code. Please recheck your code." });
      }

      if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
        return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
      }

      user.isEmailVerified = true;
      user.emailVerificationOtp = null;
      user.emailVerificationExpires = null;

      const token = generateToken(user._id);
      const safeUser = { ...user };
      delete safeUser.password;

      return res.json({
        success: true,
        token,
        user: safeUser,
        message: "Email address verified successfully. Welcome to AtithiGo Atelier."
      });
    }

    // Mongoose path
    const user = await User.findOne({ email: normalizedEmail }).select("+emailVerificationOtp +emailVerificationExpires");
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (user.isEmailVerified) {
      return res.json({ success: true, message: "Your email address is already verified." });
    }

    if (!user.emailVerificationOtp || user.emailVerificationOtp !== cleanOtp) {
      return res.status(400).json({ message: "Invalid verification code. Please recheck your code." });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
        membership: user.membership
      },
      message: "Email address verified successfully. Welcome to AtithiGo Atelier."
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Resend email verification OTP with cooldown
 * @route   POST /api/auth/resend-verification-otp
 */
exports.resendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide your email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const newOtp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.json({ success: true, message: "If an account exists, a new code has been dispatched." });
      }
      user.emailVerificationOtp = newOtp;
      user.emailVerificationExpires = expires;
      const isDev = process.env.NODE_ENV !== "production";
      return res.json({
        success: true,
        message: "A fresh verification code has been dispatched to your email.",
        ...(isDev ? { devOtp: newOtp } : {})
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+lastOtpSentAt");
    if (!user) {
      return res.json({ success: true, message: "If an account exists, a new code has been dispatched." });
    }

    // Cooldown check (60 seconds)
    if (user.lastOtpSentAt && Date.now() - new Date(user.lastOtpSentAt).getTime() < 60000) {
      const remainingSecs = Math.ceil((60000 - (Date.now() - new Date(user.lastOtpSentAt).getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${remainingSecs} seconds before requesting another code.` });
    }

    user.emailVerificationOtp = newOtp;
    user.emailVerificationExpires = expires;
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendVerificationOtpEmail(normalizedEmail, user.name, newOtp);

    const isDev = process.env.NODE_ENV !== "production";
    res.json({
      success: true,
      message: "A fresh verification code has been dispatched to your email.",
      ...(isDev ? { devOtp: newOtp } : {})
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user with credentials & optional Remember Me
 * @route   POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Please enter your email and password." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      if (user.status === "suspended") {
        return res.status(403).json({ message: "Your account is temporarily suspended. Please contact the administrator." });
      }

      const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      user.lastLogin = new Date().toISOString();
      const token = generateToken(user._id, rememberMe);
      const userSafe = { ...user };
      delete userSafe.password;
      delete userSafe.emailVerificationOtp;
      delete userSafe.resetPasswordOtp;

      return res.json({
        token,
        user: userSafe,
        message: "Welcome back to AtithiGo Atelier."
      });
    }

    // Mongoose path
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account is temporarily suspended. Please contact the administrator." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, rememberMe);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membership: user.membership,
        department: user.department,
        assignedProperty: user.assignedProperty,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        avatar: user.avatar
      },
      message: "Welcome back to AtithiGo Atelier."
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Forgot Password Request: generates 6-digit OTP
 * @route   POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide your registered email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const isDev = process.env.NODE_ENV !== "production";
    const store = req.app.locals.inMemoryStore;
    let emailResult = null;
    let dispatchedOtp = null;

    if (store) {
      const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (user) {
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = expires;
        user.resetOtpAttempts = 0;
        emailResult = await sendPasswordResetOtpEmail(normalizedEmail, user.name, otp);
        dispatchedOtp = otp;
      } else if (isDev) {
        return res.status(404).json({
          message: `No registered account found for "${normalizedEmail}". Please register first or use an existing test account like guest@atithigo.com / admin@hotelpro.com.`
        });
      }
      return res.json({
        success: true,
        message: "If an account matches that email, a 6-digit recovery code has been sent.",
        ...(isDev && dispatchedOtp ? { devOtp: dispatchedOtp, simulated: emailResult?.simulated } : {})
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.resetPasswordOtp = otp;
      user.resetPasswordExpires = expires;
      user.resetOtpAttempts = 0;
      user.lastOtpSentAt = new Date();
      await user.save();

      emailResult = await sendPasswordResetOtpEmail(normalizedEmail, user.name, otp);
      dispatchedOtp = otp;
    } else if (isDev) {
      return res.status(404).json({
        message: `No registered account found for "${normalizedEmail}". Please register an account first, or check the spelling.`
      });
    }

    // Always return success to prevent email enumeration attacks in production
    res.json({
      success: true,
      message: "If an account matches that email, a 6-digit recovery code has been sent.",
      ...(isDev && dispatchedOtp ? { devOtp: dispatchedOtp, simulated: emailResult?.simulated } : {})
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify Reset OTP before password change
 * @route   POST /api/auth/verify-reset-otp
 */
exports.verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide both email and recovery code." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user || user.resetPasswordOtp !== cleanOtp) {
        return res.status(400).json({ message: "Invalid or expired recovery code." });
      }
      if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
        return res.status(400).json({ message: "Recovery code has expired. Please request a new one." });
      }
      return res.json({ success: true, message: "Code verified. Please set your new password." });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+resetPasswordOtp +resetPasswordExpires +resetOtpAttempts");
    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({ message: "Invalid or expired recovery code." });
    }

    if (user.resetOtpAttempts >= 5) {
      return res.status(429).json({ message: "Maximum verification attempts exceeded. Please request a new code." });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Recovery code has expired. Please request a new code." });
    }

    if (user.resetPasswordOtp !== cleanOtp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid recovery code. Please check and re-enter." });
    }

    res.json({ success: true, message: "Code verified. Please set your new password." });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reset password using verified OTP
 * @route   POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters in length." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp ? otp.toString().trim() : null;

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(404).json({ message: "User account not found." });
      }
      if (cleanOtp && user.resetPasswordOtp && user.resetPasswordOtp !== cleanOtp) {
        return res.status(400).json({ message: "Invalid recovery code." });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      user.resetOtpAttempts = 0;

      await sendPasswordResetSuccessEmail(normalizedEmail, user.name);

      return res.json({
        success: true,
        message: "Your password has been successfully reset. You may now sign in."
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+resetPasswordOtp +resetPasswordExpires");
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (cleanOtp && user.resetPasswordOtp && user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({ message: "Invalid recovery code." });
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    user.resetOtpAttempts = 0;
    await user.save();

    await sendPasswordResetSuccessEmail(normalizedEmail, user.name);

    res.json({
      success: true,
      message: "Your password has been successfully reset. You may now sign in."
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Social Authentication (Google, Facebook, LinkedIn)
 * @route   POST /api/auth/social-login
 */
exports.socialLogin = async (req, res, next) => {
  try {
    const { provider, socialToken, profile } = req.body;

    if (!provider || !["google", "facebook", "linkedin"].includes(provider)) {
      return res.status(400).json({ message: "Unsupported or missing social login provider." });
    }

    if (!profile || !profile.email) {
      return res.status(400).json({ message: "Unable to retrieve verified email from social provider." });
    }

    const normalizedEmail = profile.email.trim().toLowerCase();
    const name = profile.name || profile.displayName || "Atelier Guest";
    const avatar = profile.avatar || profile.picture || "";
    const providerId = profile.id || profile.sub || `soc_${Date.now()}`;

    const store = req.app.locals.inMemoryStore;
    if (store) {
      let user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        // Create new customer account - strictly customer role, never staff/admin!
        user = {
          _id: `user_${Date.now()}`,
          name,
          email: normalizedEmail,
          password: await bcrypt.hash(`social_${Date.now()}_${Math.random()}`, 10),
          role: "customer",
          status: "active",
          phone: "",
          membership: "Gold Atelier Member",
          avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
          isEmailVerified: true,
          socialIdentities: { [`${provider}Id`]: providerId, provider },
          createdAt: new Date().toISOString()
        };
        store.users.push(user);
      } else {
        user.lastLogin = new Date().toISOString();
      }

      const token = generateToken(user._id);
      const safeUser = { ...user };
      delete safeUser.password;

      return res.json({
        token,
        user: safeUser,
        message: `Signed in successfully via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`
      });
    }

    // Mongoose path
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // New social customer account
      const randomPass = `social_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      user = await User.create({
        name,
        email: normalizedEmail,
        password: randomPass,
        role: "customer", // Strictly customer
        status: "active",
        membership: "Gold Atelier Member",
        avatar: avatar || "",
        isEmailVerified: true,
        socialIdentities: { [`${provider}Id`]: providerId, provider },
        lastLogin: new Date()
      });
    } else {
      if (user.status === "suspended") {
        return res.status(403).json({ message: "Your account is temporarily suspended." });
      }
      user.lastLogin = new Date();
      if (!user.socialIdentities) user.socialIdentities = {};
      user.socialIdentities[`${provider}Id`] = providerId;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membership: user.membership,
        department: user.department,
        status: user.status,
        avatar: user.avatar
      },
      message: `Signed in successfully via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change password for authenticated user
 * @route   POST /api/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passkey." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New passkey must be at least 6 characters in length." });
    }

    const store = req.app.locals.inMemoryStore;
    if (store) {
      const user = store.users.find((u) => u._id.toString() === req.user._id.toString());
      if (!user) return res.status(404).json({ message: "User account not found." });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current passkey is incorrect." });

      user.password = await bcrypt.hash(newPassword, 10);
      return res.json({ success: true, message: "Passkey updated successfully." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User account not found." });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current passkey is incorrect." });

    user.password = newPassword;
    await user.save();

    await sendPasswordResetSuccessEmail(user.email, user.name);

    res.json({ success: true, message: "Passkey updated successfully." });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const rawUser = req.user?.toObject ? req.user.toObject() : { ...req.user };
    delete rawUser.password;
    delete rawUser.emailVerificationOtp;
    delete rawUser.resetPasswordOtp;
    res.json({ user: rawUser });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update personal user profile
 * @route   PUT /api/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const store = req.app.locals.inMemoryStore;

    if (store) {
      const user = store.users.find((u) => u._id.toString() === req.user._id.toString());
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (avatar) user.avatar = avatar;

      const safeUser = { ...user };
      delete safeUser.password;
      return res.json({ user: safeUser, message: "Profile updated successfully." });
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (avatar) updateFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true
    }).select("-password -emailVerificationOtp -resetPasswordOtp");

    res.json({ user: updatedUser, message: "Profile updated successfully." });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user session
 * @route   POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
};
