const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load .env explicitly from backend directory regardless of cwd
dotenv.config({ path: path.join(__dirname, ".env") });

// Startup Environment Validation: Never use fallback secret in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("placeholder") || process.env.JWT_SECRET.length < 32) {
    console.error("FATAL ERROR: In production mode, a cryptographically secure JWT_SECRET of at least 32 characters is required.");
    process.exit(1);
  }
} else {
  // Development/Test fallback secret (clearly labelled for dev only)
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "hotelpro_dev_only_jwt_secret_token_never_use_in_production_32c";
  }
}

const { errorHandler } = require("./middleware/errorHandler");
const { initDataStore, closeDataStore } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Disable X-Powered-By header to prevent framework fingerprinting
app.disable("x-powered-by");

// Standard Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production" || req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Configure CORS securely
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

const configuredOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultAllowedOrigins;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests without origin header (e.g. mobile apps, curl, tests)
    if (!origin) return callback(null, true);

    // In dev / test mode, permit any localhost origin
    if (process.env.NODE_ENV !== "production") {
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: origin '${origin}' is not permitted.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/images", express.static(path.join(__dirname, "../client/public/images")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/hotels", require("./routes/hotelRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  const providerMode = (process.env.HOTEL_INVENTORY_PROVIDER || "demo").toLowerCase().trim();
  res.json({
    status: "online",
    name: "HotelPro — Hotel Booking & Management API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    inventoryProviderMode: providerMode,
    database: app.locals.inMemoryStore ? "In-Memory Resilient Store (Dev Mode)" : "MongoDB",
    timestamp: new Date().toISOString()
  });
});

// 404 Handler for unmatched API routes
app.use((req, res, next) => {
  res.status(404).json({
    message: `Resource not located: ${req.method} ${req.originalUrl || req.url}`
  });
});

// Central Error Handler
app.use(errorHandler);

/**
 * Initializes database / data store and starts the HTTP listener.
 * The server is guaranteed NEVER to bind to a port before the chosen
 * data store has successfully initialized.
 */
const startServer = async (port = PORT) => {
  try {
    // 1. Initialize data store according to strict environment rules
    await initDataStore(app);

    // 2. Start HTTP server only after data store is verified & ready
    return new Promise((resolve, reject) => {
      const server = app.listen(port, "0.0.0.0", () => {
        const providerMode = (process.env.HOTEL_INVENTORY_PROVIDER || "demo").toLowerCase().trim();
        console.log(`✦ HotelPro Server is running at http://localhost:${port}`);
        console.log(`✦ Inventory Provider Mode: ${providerMode.toUpperCase()} (${providerMode === "live" ? "Live External Adapter" : "Curated Demo Catalog"})`);
        resolve(server);
      });
      server.on("error", reject);
    });
  } catch (err) {
    console.error("FATAL: Failed to start HotelPro server:", err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, closeDataStore };
