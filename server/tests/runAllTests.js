/**
 * HotelPro Unified Automated Test Runner & Verification Suite
 *
 * Capabilities:
 * 1. Executes all 9 HotelPro test suites deterministically.
 * 2. Provides environment isolation (NODE_ENV=test, DATA_STORE=memory).
 * 3. Automatically spins up an ephemeral test server if backend is offline.
 * 4. Parses and reports passed, failed, skipped, and blocked tests separately.
 * 5. Returns exit code 0 on complete success, or 1 on any failure.
 */

const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const TEST_SUITES = [
  {
    name: "Security, Booking & Data Integrity",
    file: "tests/securityAndIntegrity.test.js",
    requiresHttp: true
  },
  {
    name: "India Hotel Search & Discovery",
    file: "tests/indiaHotelDiscovery.test.js",
    requiresHttp: true
  },
  {
    name: "Hotel Provider Mode & Integration",
    file: "tests/hotelProvider.test.js",
    requiresHttp: true
  },
  {
    name: "Booking Price & Tax Accuracy",
    file: "tests/bookingPriceAndTax.test.js",
    requiresHttp: false
  },
  {
    name: "MongoDB Connection & Store Mode",
    file: "tests/mongoAndStoreMode.test.js",
    requiresHttp: false
  },
  {
    name: "Payment Verification & Gateway",
    file: "tests/bookingPaymentVerification.test.js",
    requiresHttp: true
  },
  {
    name: "Cancellation & Refund Workflow",
    file: "tests/cancellationAndRefund.test.js",
    requiresHttp: true
  },
  {
    name: "Booking Lifecycle, Availability & Concurrency",
    file: "tests/bookingLifecycleAndConcurrency.test.js",
    requiresHttp: true
  },
  {
    name: "Admin Dashboard Analytics",
    file: "tests/adminAnalytics.test.js",
    requiresHttp: true
  },
  {
    name: "Idempotent Seeder & Relationship Repair",
    file: "tests/idempotentSeeder.test.js",
    requiresHttp: false
  }
];

// Helper to probe if an HTTP endpoint is healthy
function probeHealth(url, timeoutMs = 1200) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port || 80,
          path: u.pathname,
          method: "GET",
          timeout: timeoutMs
        },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

function runSuite(suite, env) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const suitePath = path.join(__dirname, "..", suite.file);

    const childEnv = {
      ...process.env,
      NODE_ENV: "test",
      ...env
    };
    // Ensure isolated unit tests test clean environment defaults without leaked parent flags
    delete childEnv.DATA_STORE;
    delete childEnv.ALLOW_IN_MEMORY_DB;

    const child = spawn(process.execPath, [suitePath], {
      cwd: path.join(__dirname, ".."),
      env: childEnv,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => {
      stdout += d.toString();
      process.stdout.write(d);
    });

    child.stderr.on("data", (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });

    child.on("close", (code) => {
      const durationMs = Date.now() - startTime;
      const combined = stdout + stderr;

      // Extract test metrics from output
      const passMatches = combined.match(/✓\s*\[PASS\]/g) || [];
      const failMatches = combined.match(/✗\s*\[FAIL\]/g) || [];
      const skipMatches = combined.match(/⚠\s*\[SKIP\]/g) || [];
      const blockMatches = combined.match(/⛔\s*\[BLOCKED\]/g) || [];

      // Also check summary line patterns
      let passedCount = passMatches.length;
      let failedCount = failMatches.length;
      let skippedCount = skipMatches.length;
      let blockedCount = blockMatches.length;

      // Check for summary overrides (e.g. "SUMMARY: 19 / 19 tests passed")
      const summaryMatch = combined.match(/SUMMARY:\s*(\d+)\s*\/\s*(\d+)\s*tests passed/i);
      if (summaryMatch && passedCount === 0) {
        passedCount = Number(summaryMatch[1]);
        failedCount = Number(summaryMatch[2]) - passedCount;
      }

      const testResultMatch = combined.match(/TEST RESULTS:\s*(\d+)\/(\d+)\s*PASSED/i);
      if (testResultMatch && passedCount === 0) {
        passedCount = Number(testResultMatch[1]);
        failedCount = Number(testResultMatch[2]) - passedCount;
      }

      // If exit code non-zero but no explicit fail matched, mark at least 1 failed
      if (code !== 0 && failedCount === 0) {
        failedCount = 1;
      }

      resolve({
        name: suite.name,
        file: suite.file,
        exitCode: code,
        passed: passedCount,
        failed: failedCount,
        skipped: skippedCount,
        blocked: blockedCount,
        durationMs
      });
    });
  });
}

async function main() {
  console.log("================================================================================");
  console.log("  HOTELPRO UNIFIED BACKEND AUTOMATED TEST SUITE RUNNER                          ");
  console.log("================================================================================\n");

  let testServer = null;
  let serverUrl = process.env.TEST_API_URL;

  if (serverUrl) {
    const isServerRunning = await probeHealth(`${serverUrl}/api/health`, 1200);
    if (isServerRunning) {
      console.log(`✓ Active HotelPro test server detected at ${serverUrl}`);
    } else {
      console.warn(`⚠ Configured TEST_API_URL (${serverUrl}) did not respond. Bootstrapping isolated ephemeral server.`);
      serverUrl = null;
    }
  }

  if (!serverUrl) {
    console.log("✦ Bootstrapping isolated ephemeral in-memory test server...");
    process.env.NODE_ENV = "test";
    process.env.DATA_STORE = "memory";
    process.env.ALLOW_IN_MEMORY_DB = "true";
    process.env.HOTEL_INVENTORY_PROVIDER = "demo";
    process.env.JWT_SECRET = "hotelpro_isolated_test_secret_32_characters_minimum";
    process.env.RAZORPAY_WEBHOOK_SECRET = "hotelpro_test_razorpay_webhook_secret_key";
    process.env.STRIPE_WEBHOOK_SECRET = "hotelpro_test_stripe_webhook_secret_key";

    const { startServer } = require("../server");
    const testPort = 5055;
    try {
      testServer = await startServer(testPort);
      serverUrl = `http://127.0.0.1:${testPort}`;
      console.log(`✓ Ephemeral test server listening on ${serverUrl}\n`);
    } catch (err) {
      console.error(`Failed to start ephemeral test server: ${err.message}`);
      process.exit(1);
    }
  }

  const testEnv = {
    NODE_ENV: "test",
    TEST_API_URL: serverUrl,
    HOTEL_INVENTORY_PROVIDER: "demo",
    ALLOW_IN_MEMORY_DB: "true"
  };

  const results = [];

  for (const suite of TEST_SUITES) {
    console.log(`\n>>> Executing Suite: ${suite.name} (${suite.file})`);
    const res = await runSuite(suite, testEnv);
    results.push(res);
  }

  // Shutdown ephemeral test server if one was started
  if (testServer) {
    console.log("\n✦ Shutting down ephemeral test server...");
    await new Promise((resolve) => testServer.close(resolve));
    const { closeDataStore } = require("../config/database");
    await closeDataStore();
    console.log("✓ Ephemeral test server closed.");
  }

  // Summary Metrics
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalBlocked = 0;
  let failedSuites = 0;

  console.log("\n================================================================================");
  console.log("  HOTELPRO TEST EXECUTION MATRIX                                                ");
  console.log("================================================================================");
  console.log(
    "Suite Name".padEnd(42) +
    "Status".padEnd(10) +
    "Passed".padEnd(8) +
    "Failed".padEnd(8) +
    "Skipped".padEnd(9) +
    "Time"
  );
  console.log("-".repeat(80));

  for (const r of results) {
    totalPassed += r.passed;
    totalFailed += r.failed;
    totalSkipped += r.skipped;
    totalBlocked += r.blocked;

    const statusStr = r.failed === 0 && r.exitCode === 0 ? "PASSED" : "FAILED";
    if (statusStr === "FAILED") failedSuites++;

    const durStr = `${(r.durationMs / 1000).toFixed(2)}s`;
    console.log(
      r.name.padEnd(42) +
      statusStr.padEnd(10) +
      String(r.passed).padEnd(8) +
      String(r.failed).padEnd(8) +
      String(r.skipped).padEnd(9) +
      durStr
    );
  }

  console.log("=".repeat(80));
  console.log(`Total Test Suites: ${results.length} | Suites Passed: ${results.length - failedSuites} | Suites Failed: ${failedSuites}`);
  console.log(`Subtests Breakdown:`);
  console.log(`  ✓ Passed:  ${totalPassed}`);
  console.log(`  ✗ Failed:  ${totalFailed}`);
  console.log(`  ⚠ Skipped: ${totalSkipped}`);
  console.log(`  ⛔ Blocked: ${totalBlocked}`);
  console.log("================================================================================\n");

  if (failedSuites > 0 || totalFailed > 0) {
    console.error("❌ AUTOMATED TEST RUN FINISHED WITH FAILURES.");
    process.exit(1);
  } else {
    console.log("✅ ALL AUTOMATED TEST SUITES PASSED SUCCESSFULLY.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Test runner fatal error:", err);
  process.exit(1);
});
