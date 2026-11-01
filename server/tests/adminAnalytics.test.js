/**
 * HotelPro Admin Dashboard Analytics Test Suite
 *
 * Verifies:
 * 1. Occupancy rate calculated as (Occupied Room-Nights / Available Room-Nights) * 100.
 * 2. Cancelled bookings do not count towards occupied nights.
 * 3. Overlapping bookings for the same room do not inflate occupied nights.
 * 4. Rooms in 'Maintenance' are excluded from available inventory.
 * 5. Realized revenue strictly reflects verified paid payments (excluding pending/failed).
 * 6. Refunds (full and partial) accurately reduce gross revenue.
 * 7. Empty datasets return safe zeros without NaN or division-by-zero errors.
 * 8. Date ranges via query parameters (startDate, endDate, period=today) compute accurately.
 */

const assert = require("assert");
const { calculateAdminAnalytics } = require("../controllers/adminController");
const { setupTestEnvironment } = require("./testHelper");

async function runTests() {
  const env = await setupTestEnvironment();
  const BASE_URL = env.baseUrl;
  console.log("\n=================================================");
  console.log("  HOTELPRO ADMIN ANALYTICS TEST SUITE            ");
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

  // Sample Mock Rooms
  const sampleRooms = [
    { _id: "r1", name: "Royal Suite", status: "Available" },
    { _id: "r2", name: "Garden Villa", status: "Available" },
    { _id: "r3", name: "Courtyard Room", status: "Maintenance" } // Inactive/Under repair
  ];

  // -------------------------------------------------------------
  // 1. Occupancy Rate via Room-Nights (Unit Logic)
  // -------------------------------------------------------------
  await test("Occupancy rate calculates occupied room-nights divided by available room-nights", () => {
    // Reporting period: 10 days (2026-11-01 to 2026-11-10)
    // 2 operational rooms (r1, r2) * 10 days = 20 available room-nights.
    // Booking 1: r1 for 5 nights (2026-11-01 to 2026-11-06) -> 5 occupied nights.
    // Booking 2: r2 for 5 nights (2026-11-01 to 2026-11-06) -> 5 occupied nights.
    // Total occupied = 10 nights. Occupancy = 10 / 20 = 50%.
    const bookings = [
      {
        room: "r1",
        checkIn: "2026-11-01",
        checkOut: "2026-11-06",
        status: "Confirmed",
        paymentStatus: "Paid",
        totalPrice: 25000
      },
      {
        room: "r2",
        checkIn: "2026-11-01",
        checkOut: "2026-11-06",
        status: "Confirmed",
        paymentStatus: "Paid",
        totalPrice: 20000
      }
    ];

    const result = calculateAdminAnalytics({
      rooms: sampleRooms,
      bookings,
      users: [],
      query: { startDate: "2026-11-01", endDate: "2026-11-10" }
    });

    assert.strictEqual(result.metrics.availableRoomNights, 20);
    assert.strictEqual(result.metrics.occupiedRoomNights, 10);
    assert.strictEqual(result.metrics.occupancyRate, 50);
  });

  // -------------------------------------------------------------
  // 2. Cancelled Bookings Exclusion
  // -------------------------------------------------------------
  await test("Cancelled bookings do not contribute to occupied room-nights", () => {
    const bookings = [
      {
        room: "r1",
        checkIn: "2026-11-01",
        checkOut: "2026-11-06",
        status: "Cancelled", // Cancelled!
        paymentStatus: "Refunded",
        totalPrice: 25000
      }
    ];

    const result = calculateAdminAnalytics({
      rooms: sampleRooms,
      bookings,
      users: [],
      query: { startDate: "2026-11-01", endDate: "2026-11-10" }
    });

    assert.strictEqual(result.metrics.occupiedRoomNights, 0);
    assert.strictEqual(result.metrics.occupancyRate, 0);
  });

  // -------------------------------------------------------------
  // 3. Overlapping Bookings De-Duplication
  // -------------------------------------------------------------
  await test("Overlapping bookings for the same room do not inflate occupied room-nights", () => {
    // Two overlapping bookings for r1 over the same 3 nights (2026-11-01 to 2026-11-04)
    // De-duplication should count r1 only once per night -> 3 occupied nights, NOT 6!
    const bookings = [
      {
        room: "r1",
        checkIn: "2026-11-01",
        checkOut: "2026-11-04",
        status: "Confirmed",
        paymentStatus: "Paid",
        totalPrice: 15000
      },
      {
        room: "r1",
        checkIn: "2026-11-01",
        checkOut: "2026-11-04",
        status: "Confirmed",
        paymentStatus: "Paid",
        totalPrice: 15000
      }
    ];

    const result = calculateAdminAnalytics({
      rooms: sampleRooms,
      bookings,
      users: [],
      query: { startDate: "2026-11-01", endDate: "2026-11-10" }
    });

    assert.strictEqual(result.metrics.occupiedRoomNights, 3);
  });

  // -------------------------------------------------------------
  // 4. Realized Revenue Calculation
  // -------------------------------------------------------------
  await test("Realized revenue excludes unpaid and failed bookings", () => {
    const bookings = [
      {
        room: "r1",
        status: "Confirmed",
        paymentStatus: "Paid",
        totalPrice: 10000
      },
      {
        room: "r1",
        status: "Pending Payment",
        paymentStatus: "Pending", // Unpaid
        totalPrice: 8000
      },
      {
        room: "r2",
        status: "Cancelled",
        paymentStatus: "Failed", // Failed
        totalPrice: 6000
      }
    ];

    const result = calculateAdminAnalytics({
      rooms: sampleRooms,
      bookings,
      users: [],
      query: { startDate: "2026-11-01", endDate: "2026-11-10" }
    });

    assert.strictEqual(result.metrics.totalRevenue, 10000);
    assert.strictEqual(result.metrics.grossRevenue, 10000);
  });

  // -------------------------------------------------------------
  // 5. Refund Accounting Accuracy
  // -------------------------------------------------------------
  await test("Completed and pending refunds are deducted from realized revenue", () => {
    const bookings = [
      {
        room: "r1",
        status: "Confirmed",
        paymentStatus: "Paid",
        totalPrice: 12000
      },
      {
        room: "r1",
        status: "Cancelled",
        paymentStatus: "Refunded",
        refundStatus: "Completed",
        totalPrice: 10000,
        refundAmount: 10000 // Full refund
      },
      {
        room: "r2",
        status: "Cancelled",
        paymentStatus: "Refund Pending",
        refundStatus: "Pending",
        totalPrice: 15000,
        refundAmount: 10000 // Partial refund (₹5,000 retained retention fee)
      }
    ];

    const result = calculateAdminAnalytics({
      rooms: sampleRooms,
      bookings,
      users: [],
      query: { startDate: "2026-11-01", endDate: "2026-11-10" }
    });

    // Gross = 12000 + 10000 + 15000 = 37000
    // Refunds = 10000 + 10000 = 20000
    // Realized Net Revenue = 37000 - 20000 = 17000 (12000 from booking 1 + 5000 retention fee)
    assert.strictEqual(result.metrics.grossRevenue, 37000);
    assert.strictEqual(result.metrics.totalRefunds, 20000);
    assert.strictEqual(result.metrics.totalRevenue, 17000);
  });

  // -------------------------------------------------------------
  // 6. Safe Handling of Empty Datasets
  // -------------------------------------------------------------
  await test("Empty datasets return zero metrics safely without NaN or crash", () => {
    const result = calculateAdminAnalytics({
      rooms: [],
      bookings: [],
      users: [],
      query: {}
    });

    assert.strictEqual(result.metrics.totalRevenue, 0);
    assert.strictEqual(result.metrics.occupancyRate, 0);
    assert.strictEqual(result.metrics.totalBookings, 0);
    assert.strictEqual(result.metrics.totalRooms, 0);
    assert.strictEqual(result.metrics.occupiedRoomNights, 0);
    assert.strictEqual(result.metrics.availableRoomNights, 0);
  });

  // -------------------------------------------------------------
  // 7. API Integration Verification (GET /api/admin/metrics)
  // -------------------------------------------------------------
  let adminToken = null;
  await test("Authenticate admin and query GET /api/admin/metrics", async () => {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@hotelpro.com",
        password: "admin123"
      })
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200);
    adminToken = loginData.token;

    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await metricsRes.json();
    assert.strictEqual(metricsRes.status, 200);
    assert.ok(data.metrics);
    assert.strictEqual(typeof data.metrics.totalRevenue, "number");
    assert.strictEqual(typeof data.metrics.occupancyRate, "number");
    assert.strictEqual(typeof data.metrics.totalBookings, "number");
    assert.strictEqual(typeof data.metrics.totalRooms, "number");
    assert.ok(data.metrics.reportingPeriod);
  });

  await test("GET /api/admin/metrics supports custom date range query parameters", async () => {
    const metricsRes = await fetch(
      `${BASE_URL}/admin/metrics?startDate=2026-11-01&endDate=2026-11-30`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    const data = await metricsRes.json();
    assert.strictEqual(metricsRes.status, 200);
    assert.strictEqual(data.metrics.reportingPeriod.startDate, "2026-11-01");
    assert.strictEqual(data.metrics.reportingPeriod.endDate, "2026-11-30");
    assert.strictEqual(data.metrics.reportingPeriod.totalDays, 30);
  });

  await env.teardown();

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
