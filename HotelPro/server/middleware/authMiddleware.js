const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token.trim() === "" || token === "null" || token === "undefined") {
    return res.status(401).json({ message: "Not authorized. No access token provided." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server authentication configuration error: JWT_SECRET missing." });
  }

  try {
    // Strictly enforce HS256 algorithm to prevent algorithm downgrade attacks
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });

    // Validate required claims in token payload
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return res.status(401).json({ message: "Invalid authorization token payload: missing subject identifier." });
    }

    // In-Memory store path
    if (req.app.locals.inMemoryStore) {
      const user = req.app.locals.inMemoryStore.users.find(
        (u) => u._id.toString() === decoded.id.toString()
      );
      if (!user) {
        return res.status(401).json({ message: "Authentication session expired or user no longer exists." });
      }
      // Never attach password hash to req.user in memory
      const safeUser = { ...user };
      delete safeUser.password;
      req.user = safeUser;
      return next();
    }

    // Mongoose path: validate ObjectId before querying to prevent CastErrors
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: "Authentication session expired or user no longer exists." });
    }

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Authentication session expired or user no longer exists." });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authorization token. Please sign in again.",
      error: error.name === "TokenExpiredError" ? "Token expired" : "Invalid signature"
    });
  }
};

module.exports = { protect };
