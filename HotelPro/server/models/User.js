const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["guest", "customer", "staff", "admin"],
      default: "customer"
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending_verification"],
      default: "active"
    },
    phone: { type: String, default: "" },
    membership: { type: String, default: "Guest Atelier" },
    department: { type: String, default: "" },
    assignedProperty: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },

    // OTP Verification & Password Recovery
    emailVerificationOtp: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    resetPasswordOtp: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    resetOtpAttempts: { type: Number, default: 0, select: false },
    lastOtpSentAt: { type: Date, select: false },

    // Social Identity Providers
    socialIdentities: {
      googleId: { type: String, default: null },
      facebookId: { type: String, default: null },
      linkedinId: { type: String, default: null },
      provider: { type: String, default: null }
    },

    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
