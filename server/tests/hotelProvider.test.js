/**
 * HotelPro Hotel Inventory Provider Mode & Integration Test Suite
 *
 * Verifies explicit separation between Demo and Live provider modes,
 * error handling for unconfigured live providers, and zero silent fallback.
 */

const assert = require("assert");
const LiveHotelProviderInterface = require("../services/providers/liveProviderInterface");
const DemoHotelProvider = require("../services/providers/demoProvider");
const { getHotelProvider, getProviderStatus } = require("../services/providers");
const { setupTestEnvironment } = require("./testHelper");

async function runTests() {
  const env = await setupTestEnvironment();
  const BASE_URL = env.serverUrl;
  console.log("\n=================================================");
  console.log("  HOTELPRO HOTEL INVENTORY PROVIDER TEST SUITE   ");
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

  // 1. Live Provider Unit Integrity - Unconfigured
  await test("Live provider without API key reports isConfigured() === false", async () => {
    const provider = new LiveHotelProviderInterface({ apiKey: "" });
    assert.strictEqual(provider.isConfigured(), false);
    assert.strictEqual(provider.isLiveIntegrated(), false);
  });

  // 2. Live Provider Rejects Search without Credentials (HTTP 503)
  await test("Unconfigured live provider throws LIVE_PROVIDER_NOT_CONFIGURED (503)", async () => {
    const provider = new LiveHotelProviderInterface({ apiKey: "" });
    try {
      await provider.searchHotels({ destination: "Mumbai" });
      assert.fail("Should have thrown error");
    } catch (err) {
      assert.strictEqual(err.code, "LIVE_PROVIDER_NOT_CONFIGURED");
      assert.strictEqual(err.statusCode, 503);
    }
  });

  // 3. Live Provider with Credentials Acknowledges Live Contract Requirement (HTTP 501)
  await test("Configured live provider explicitly reports 501 Not Implemented rather than faking inventory", async () => {
    const provider = new LiveHotelProviderInterface({ apiKey: "test_amadeus_key_sample" });
    assert.strictEqual(provider.isConfigured(), true);
    assert.strictEqual(provider.isLiveIntegrated(), false);
    try {
      await provider.searchHotels({ destination: "Delhi" });
      assert.fail("Should have thrown error");
    } catch (err) {
      assert.strictEqual(err.code, "LIVE_PROVIDER_NOT_IMPLEMENTED");
      assert.strictEqual(err.statusCode, 501);
    }
  });

  // 4. Demo Provider Unit Integrity
  await test("Demo provider isConfigured() is true and identifies as HotelPro_Demo_Provider", async () => {
    const demo = new DemoHotelProvider();
    assert.strictEqual(demo.name, "HotelPro_Demo_Provider");
    assert.strictEqual(demo.isConfigured(), true);
    assert.strictEqual(demo.isLiveIntegrated(), false);
  });

  // 5. Zero Silent Fallback Under Live Configuration
  await test("Provider factory returns Live provider when HOTEL_INVENTORY_PROVIDER=live", async () => {
    const originalEnv = process.env.HOTEL_INVENTORY_PROVIDER;
    process.env.HOTEL_INVENTORY_PROVIDER = "live";
    try {
      const provider = getHotelProvider();
      assert.strictEqual(provider.name, "Live_Hotel_Provider_Adapter", "Must NOT silently return demo provider in live mode");
    } finally {
      process.env.HOTEL_INVENTORY_PROVIDER = originalEnv || "demo";
    }
  });

  // 6. Provider Status Telemetry Endpoint
  await test("GET /api/hotels/provider-status returns structured telemetry", async () => {
    const res = await fetch(`${BASE_URL}/api/hotels/provider-status`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.mode === "demo" || data.mode === "live");
    assert.ok(typeof data.providerName === "string");
    assert.strictEqual(typeof data.isConfigured, "boolean");
    assert.strictEqual(data.isLiveIntegrated, false, "Live integration must be false until genuine external API is wired");
  });

  // 7. Active Search Endpoint Returns Mode Metadata
  await test("Active search endpoint returns mode: 'demo' and isDemo: true in demo mode", async () => {
    const res = await fetch(`${BASE_URL}/api/hotels/search?destination=Goa`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.mode, "demo");
    assert.strictEqual(data.isDemo, true);
    assert(data.count >= 1, "Should return demo hotels");
  });

  // 8. Secret Isolation - Provider Secrets Never Leaked
  await test("Provider status and health endpoints never leak API keys or secrets", async () => {
    const statusRes = await fetch(`${BASE_URL}/api/hotels/provider-status`);
    const statusData = await statusRes.json();
    assert.strictEqual(statusData.apiKey, undefined, "apiKey must NOT be exposed");
    assert.strictEqual(statusData.apiSecret, undefined, "apiSecret must NOT be exposed");

    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.apiKey, undefined);
    assert.strictEqual(healthData.inventoryProviderMode, "demo");
  });

  // 9. Provider Runtime Failure Rejection (No Silent Fallback)
  await test("Simulated upstream provider failure does not fall back to demo data", async () => {
    const brokenProvider = new LiveHotelProviderInterface({ apiKey: "some_key" });
    try {
      await brokenProvider.searchHotels({ destination: "Kolkata" });
      assert.fail("Should reject when upstream live integration is not wired");
    } catch (err) {
      assert.strictEqual(err.code, "LIVE_PROVIDER_NOT_IMPLEMENTED");
      assert.strictEqual(err.statusCode, 501);
    }
  });

  await env.teardown();

  console.log("\n-------------------------------------------------");
  console.log(`  SUMMARY: ${passed} / ${total} tests passed successfully.`);
  console.log("-------------------------------------------------\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
