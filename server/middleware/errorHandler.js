/**
 * Central Error Handler Middleware
 *
 * Catches asynchronous errors, translates Mongoose and JWT errors to standard HTTP status codes,
 * and sanitizes responses and logs to prevent leaking sensitive credentials, tokens, or personal data.
 */
const { sanitizeErrorMessage } = require("../config/database");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  let statusCode = err.statusCode || err.status;
  if (!statusCode || statusCode === 200) {
    statusCode = 500;
  }

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 404;
    error.message = `Resource not found with specified identifier.`;
  }

  // 2. Mongoose Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    error.message = `A record with this ${field} already exists.`;
  }

  // 3. Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = err.errors ? Object.values(err.errors).map((e) => e.message) : [];
    error.message = messages.length > 0 ? `Validation Error: ${messages.join("; ")}` : "Validation failed.";
  }

  // 4. JWT Verification Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    error.message = "Invalid authorization token. Please sign in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    error.message = "Authorization token has expired. Please sign in again.";
  }

  // 5. CORS Errors
  if (err.message && err.message.includes("CORS policy violation")) {
    statusCode = 403;
    error.message = err.message;
  }

  // Sanitize message: never leak secrets or database connection strings
  const cleanMessage = sanitizeErrorMessage(error.message || "Internal Server Error", process.env.MONGODB_URI);

  // In production, mask 500 internal server errors completely
  const clientMessage =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "An internal server error occurred. Please contact concierge support."
      : cleanMessage;

  // Sanitize error log: never log request body passwords, tokens, or auth headers
  const sanitizedMethod = req.method;
  const sanitizedUrl = req.originalUrl || req.url;
  if (process.env.NODE_ENV !== "test") {
    console.error(`[Backend Error] ${sanitizedMethod} ${sanitizedUrl} -> ${statusCode}: ${cleanMessage}`);
    if (statusCode === 500 && process.env.NODE_ENV !== "production") {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    message: clientMessage,
    code: err.code || (statusCode === 404 ? "NOT_FOUND" : statusCode === 400 ? "BAD_REQUEST" : undefined),
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = { errorHandler };
