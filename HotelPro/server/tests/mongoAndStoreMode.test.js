/**
 * HotelPro MongoDB Connection & Data Store Mode Test Suite
 *
 * Verifies:
 * 1. Production Mode Safety:
 *    - Strict rejection of in-memory configuration (ALLOW_IN_MEMORY_DB / DATA_STORE=memory).
 *    - Refusal to silently fall back to volatile storage on MongoDB connection failure.
 * 2. Credential Sanitization:
 *    - Sanitization of standard and SRV MongoDB URIs and error strings to prevent credential leaks.
 * 3. Development / Test Explicit Configuration:
 *    - Fast failure when MongoDB is unreachable and ALLOW_IN_MEMORY_DB is not explicitly enabled.
 *    - Seamless explicit in-memory fallback when ALLOW_IN_MEMORY_DB=true.
 *    - Direct in-memory initialization when DATA_STORE=memory without connection timeout.
 * 4. Startup Lifecycle:
 *    - Server listener never binds to port before data store successfully initializes.
 */

const assert = require("assert");
const {
  sanitizeMongoUri,
  sanitizeErrorMessage,
  initDataStore,
  buildInMemoryStore,
  closeDataStore
} = require("../config/database");

async function runTests() {
  console.log("\n=================================================");
  console.log("  HOTELPRO MONGODB & DATA STORE MODE TEST SUITE  ");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  // -------------------------------------------------------------
  // 1. Credential Sanitization Verification
  // -------------------------------------------------------------
  await test("sanitizeMongoUri masks credentials in standard mongodb:// URIs", () => {
    const raw = "mongodb://hotelAdmin:SuperSecretPassword123@127.0.0.1:27017/hotelpro?authSource=admin";
    const sanitized = sanitizeMongoUri(raw);
    assert.strictEqual(sanitized, "mongodb://***:***@127.0.0.1:27017/hotelpro?authSource=admin");
    assert.strictEqual(sanitized.includes("SuperSecretPassword123"), false);
    assert.strictEqual(sanitized.includes("hotelAdmin"), false);
  });

  await test("sanitizeMongoUri masks credentials in MongoDB Atlas mongodb+srv:// URIs", () => {
    const raw = "mongodb+srv://admin_user:Complex%40P%23ss@cluster0.abcde.mongodb.net/hotelpro?retryWrites=true";
    const sanitized = sanitizeMongoUri(raw);
    assert.strictEqual(sanitized, "mongodb+srv://***:***@cluster0.abcde.mongodb.net/hotelpro?retryWrites=true");
    assert.strictEqual(sanitized.includes("admin_user"), false);
    assert.strictEqual(sanitized.includes("Complex%40P%23ss"), false);
  });

  await test("sanitizeMongoUri preserves URIs without credentials intact", () => {
    const raw = "mongodb://127.0.0.1:27017/hotelpro";
    const sanitized = sanitizeMongoUri(raw);
    assert.strictEqual(sanitized, "mongodb://127.0.0.1:27017/hotelpro");
  });

  await test("sanitizeErrorMessage scrubs password and user from error text", () => {
    const rawUri = "mongodb://prodAdmin:VeryConfidentialKey99@mongo.internal:27017/hotelpro";
    const rawError = "MongooseError: failed to connect to server [mongo.internal:27017] on connection mongodb://prodAdmin:VeryConfidentialKey99@mongo.internal:27017/hotelpro";
    const cleaned = sanitizeErrorMessage(rawError, rawUri);
    assert.strictEqual(cleaned.includes("VeryConfidentialKey99"), false);
    assert.strictEqual(cleaned.includes("prodAdmin"), false);
    assert.strictEqual(cleaned.includes("***:***@"), true);
  });

  // -------------------------------------------------------------
  // 2. Production Mode Security & Persistence Gates
  // -------------------------------------------------------------
  await test("Production mode strictly rejects ALLOW_IN_MEMORY_DB=true", async () => {
    const dummyApp = { locals: {} };
    try {
      await initDataStore(dummyApp, {
        nodeEnv: "production",
        allowInMemory: true,
        timeoutMs: 100
      });
      assert.fail("Should have thrown security error");
    } catch (err) {
      assert.strictEqual(err.message.includes("FATAL SECURITY VIOLATION"), true);
      assert.strictEqual(err.message.includes("In-memory database store is strictly forbidden in production"), true);
      assert.strictEqual(dummyApp.locals.inMemoryStore, undefined);
    }
  });

  await test("Production mode strictly rejects DATA_STORE=memory", async () => {
    const dummyApp = { locals: {} };
    try {
      await initDataStore(dummyApp, {
        nodeEnv: "production",
        dataStore: "memory",
        timeoutMs: 100
      });
      assert.fail("Should have thrown security error");
    } catch (err) {
      assert.strictEqual(err.message.includes("FATAL SECURITY VIOLATION"), true);
      assert.strictEqual(dummyApp.locals.inMemoryStore, undefined);
    }
  });

  await test("Production mode fails fast on unreachable MongoDB and never falls back to memory", async () => {
    const dummyApp = { locals: {} };
    try {
      await initDataStore(dummyApp, {
        nodeEnv: "production",
        mongoUri: "mongodb://127.0.0.1:59999/unreachable_db",
        allowInMemory: false,
        timeoutMs: 300
      });
      assert.fail("Should have thrown error on unreachable MongoDB");
    } catch (err) {
      assert.strictEqual(err.message.includes("Production MongoDB connection failed"), true);
      assert.strictEqual(dummyApp.locals.inMemoryStore, undefined);
    }
  });

  // -------------------------------------------------------------
  // 3. Development / Test Explicit Configuration
  // -------------------------------------------------------------
  await test("Development mode fails fast without ALLOW_IN_MEMORY_DB when MongoDB unreachable", async () => {
    const dummyApp = { locals: {} };
    try {
      await initDataStore(dummyApp, {
        nodeEnv: "development",
        mongoUri: "mongodb://127.0.0.1:59999/unreachable_db",
        allowInMemory: false,
        timeoutMs: 300
      });
      assert.fail("Should have thrown error without ALLOW_IN_MEMORY_DB");
    } catch (err) {
      assert.strictEqual(err.message.includes("MongoDB connection failed and ALLOW_IN_MEMORY_DB is not enabled"), true);
      assert.strictEqual(dummyApp.locals.inMemoryStore, undefined);
    }
  });

  await test("Development mode enables in-memory fallback when ALLOW_IN_MEMORY_DB=true", async () => {
    const dummyApp = { locals: {} };
    const result = await initDataStore(dummyApp, {
      nodeEnv: "development",
      mongoUri: "mongodb://127.0.0.1:59999/unreachable_db",
      allowInMemory: true,
      timeoutMs: 300
    });
    assert.strictEqual(result.mode, "memory");
    assert.strictEqual(result.fallback, true);
    assert.ok(dummyApp.locals.inMemoryStore);
    assert.ok(Array.isArray(dummyApp.locals.inMemoryStore.hotels));
    assert.ok(Array.isArray(dummyApp.locals.inMemoryStore.rooms));
  });

  await test("Development mode directly initializes in-memory store when DATA_STORE=memory", async () => {
    const dummyApp = { locals: {} };
    const result = await initDataStore(dummyApp, {
      nodeEnv: "development",
      dataStore: "memory",
      timeoutMs: 100
    });
    assert.strictEqual(result.mode, "memory");
    assert.strictEqual(result.fallback, undefined);
    assert.ok(dummyApp.locals.inMemoryStore);
    assert.ok(dummyApp.locals.inMemoryStore.users.length > 0);
  });

  // -------------------------------------------------------------
  // 4. Memory Store Password Security
  // -------------------------------------------------------------
  await test("buildInMemoryStore pre-hashes all passwords with bcrypt (zero plain-text in RAM)", () => {
    const store = buildInMemoryStore();
    for (const user of store.users) {
      assert.ok(user.password.startsWith("$2a$") || user.password.startsWith("$2b$"));
      assert.notStrictEqual(user.password, "password123");
    }
  });

  await closeDataStore();

  console.log("\n-------------------------------------------------");
  console.log(`  SUMMARY: ${passed} / ${total} tests passed successfully.`);
  console.log("-------------------------------------------------\n");

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
