/**
 * HotelPro Database & Data Store Configuration
 *
 * Enforces strict persistence rules:
 * 1. Production Mode: MongoDB connection is strictly mandatory.
 *    - In-memory store is completely forbidden.
 *    - Connection failures immediately abort process with a fatal error.
 *    - Sanitizes connection strings to prevent credential leakage in logs.
 * 2. Development / Test Mode:
 *    - Attempts connection to MongoDB first.
 *    - In-memory store is permitted ONLY through explicit configuration
 *      (ALLOW_IN_MEMORY_DB=true or DATA_STORE=memory).
 *    - Without explicit configuration, connection failure aborts startup fast.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { seedUsers, seedHotels, seedRooms, seedBookings, seedHousekeeping } = require("../seeds/seedData");
const { indiaHotels, indiaRooms } = require("../seeds/indiaSeedData");

/**
 * Sanitizes MongoDB URIs to redact passwords and credentials.
 * Handles standard mongodb:// and mongodb+srv:// connection schemes.
 */
function sanitizeMongoUri(uri) {
  if (!uri || typeof uri !== "string") return "";
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@\s]+):([^@\s]+)@/i, "$1***:***@");
}

/**
 * Sanitizes error messages by redacting URI credentials and passwords.
 */
function sanitizeErrorMessage(msg, uri) {
  if (!msg || typeof msg !== "string") return "";
  let clean = msg;
  if (uri) {
    const credMatch = uri.match(/(mongodb(?:\+srv)?:\/\/)([^:@\s]+):([^@\s]+)@/i);
    if (credMatch) {
      const user = credMatch[2];
      const pass = credMatch[3];
      clean = clean.split(pass).join("***").split(user).join("***");
    }
  }
  return clean.replace(/(mongodb(?:\+srv)?:\/\/)([^:@\s]+):([^@\s]+)@/gi, "$1***:***@");
}

/**
 * Builds a fresh in-memory data store with securely hashed passwords
 * for development or isolated testing.
 */
function buildInMemoryStore() {
  const combinedHotels = [
    ...JSON.parse(JSON.stringify(indiaHotels)),
    ...JSON.parse(JSON.stringify(seedHotels))
  ];

  const combinedRooms = [
    ...JSON.parse(JSON.stringify(seedRooms)),
    ...JSON.parse(JSON.stringify(indiaRooms))
  ];

  const securelyHashedUsers = seedUsers.map((u) => {
    const userCopy = { ...u };
    userCopy.password = bcrypt.hashSync(u.password, 10);
    return userCopy;
  });

  return {
    users: securelyHashedUsers,
    hotels: combinedHotels,
    rooms: combinedRooms,
    bookings: JSON.parse(JSON.stringify(seedBookings)),
    housekeeping: JSON.parse(JSON.stringify(seedHousekeeping))
  };
}

/**
 * Automatically seeds the database if collections are empty.
 */
async function seedDatabaseIfEmpty() {
  try {
    const { syncDatabase } = require("../services/seederService");
    await syncDatabase({ logger: (msg) => console.log(msg) });
  } catch (seedErr) {
    console.warn("Notice: Seeding check skipped:", seedErr.message);
  }
}

/**
 * Initializes the data store according to environment rules.
 *
 * @param {Express.Application} [app] - Optional Express app to attach store to
 * @param {Object} [options] - Optional override parameters for testing
 * @returns {Promise<{mode: string, fallback?: boolean, store?: Object, connection?: mongoose.Connection}>}
 */
async function initDataStore(app, options = {}) {
  const nodeEnv = options.nodeEnv || process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const explicitStore = (options.dataStore !== undefined ? options.dataStore : (process.env.DATA_STORE || "")).toLowerCase().trim();
  const allowInMemory = options.allowInMemory !== undefined 
    ? Boolean(options.allowInMemory) 
    : process.env.ALLOW_IN_MEMORY_DB === "true";
  const uri = options.mongoUri || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotelpro";
  const sanitizedUri = sanitizeMongoUri(uri);
  const timeoutMs = options.timeoutMs || (isProduction ? 5000 : 2000);

  // 1. Production Mode Safety Enforcement
  if (isProduction) {
    if (explicitStore === "memory" || allowInMemory) {
      const errMsg = (
        "FATAL SECURITY VIOLATION: In-memory database store is strictly forbidden in production mode. " +
        "Remove DATA_STORE=memory and ALLOW_IN_MEMORY_DB=true, and configure a valid MONGODB_URI."
      );
      console.error(`[FATAL] ${errMsg}`);
      throw new Error(errMsg);
    }

    try {
      console.log(`✦ Connecting to MongoDB at ${sanitizedUri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
      console.log("✦ Connected to MongoDB successfully (Production Mode).");
      if (app) app.locals.inMemoryStore = null;
      await seedDatabaseIfEmpty();
      return { mode: "mongodb", connection: mongoose.connection };
    } catch (err) {
      const safeMsg = sanitizeErrorMessage(err.message, uri);
      console.error(`[FATAL] Production MongoDB connection failed: ${safeMsg}`);
      console.error(`[FATAL] Refusing to start in an unsafe state without persistent database.`);
      throw new Error(`Production MongoDB connection failed: ${safeMsg}`);
    }
  }

  // 2. Development/Test Mode: Explicit In-Memory Store
  if (explicitStore === "memory") {
    console.log("✦ Using In-Memory Data Store (explicitly selected via DATA_STORE=memory).");
    const store = buildInMemoryStore();
    if (app) app.locals.inMemoryStore = store;
    return { mode: "memory", store };
  }

  // 3. Development/Test Mode: Connect to MongoDB with Explicit Fallback
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
    console.log(`✦ Connected to MongoDB successfully at ${sanitizedUri} (Primary Database Mode).`);
    if (app) app.locals.inMemoryStore = null;
    await seedDatabaseIfEmpty();
    return { mode: "mongodb", connection: mongoose.connection };
  } catch (err) {
    const safeMsg = sanitizeErrorMessage(err.message, uri);

    if (allowInMemory) {
      console.warn(`✦ Notice: MongoDB is unavailable at ${sanitizedUri} (${safeMsg}).`);
      console.warn("✦ Explicit in-memory development fallback active (ALLOW_IN_MEMORY_DB=true).");
      const store = buildInMemoryStore();
      if (app) app.locals.inMemoryStore = store;
      return { mode: "memory", fallback: true, store };
    }

    // In development without ALLOW_IN_MEMORY_DB=true, fail explicitly
    console.error(`[FATAL] Failed to connect to MongoDB at ${sanitizedUri}: ${safeMsg}`);
    console.error(`[FATAL] Silent in-memory fallback is disabled. Set ALLOW_IN_MEMORY_DB=true in backend/.env if you wish to run without local MongoDB.`);
    throw new Error(`MongoDB connection failed and ALLOW_IN_MEMORY_DB is not enabled: ${safeMsg}`);
  }
}

/**
 * Gracefully closes MongoDB connection if open.
 */
async function closeDataStore() {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  sanitizeMongoUri,
  sanitizeErrorMessage,
  buildInMemoryStore,
  seedDatabaseIfEmpty,
  initDataStore,
  closeDataStore
};
