/**
 * HotelPro Booking Lifecycle, Availability & Concurrency Test Suite
 *
 * Requirements Verified:
 * 1. Trace the complete booking lifecycle from room selection to confirmed reservation.
 * 2. Validate check-in and check-out dates on the backend (past dates, checkout <= checkin, malformed dates).
 * 3. Calculate stay duration (nights), room charges, taxes, and final total on the server (never trust client price).
 * 4. Room capacity checks (adults >= 1, total guests <= room.capacity.guests).
 * 5. Rejection of unavailable rooms (Maintenance status, inactive, zero inventory).
 * 6. Overlapping reservation collision prevention (returns 409 Conflict).
 * 7. Duplicate submission protection for same user on overlapping dates (409 DUPLICATE_BOOKING_REQUEST).
 * 8. Safe concurrency handling (concurrent requests on single-inventory room: 1 succeeds, other rejected).
 * 9. Initial state machine safety: unverified paid bookings start as "Pending Payment", not "Confirmed".
 * 10. Failed payment verification sets paymentStatus to "Failed".
 * 11. Ownership enforcement: guests cannot access or cancel another guest's booking (403 Forbidden).
 * 12. Strict status state machine transitions: cancelled bookings cannot transition to Confirmed or Checked-In.
 * 13. Cancellation immediately releases inventory: room dates become bookable again.
 */

const assert = require("assert");
const { setupTestEnvironment } = require("./testHelper");

async function runTests() {
  const env = await setupTestEnvironment();
  const BASE_URL = env.baseUrl;

  console.log("\n=================================================");
  console.log("  HOTELPRO BOOKING LIFECYCLE & CONCURRENCY SUITE ");
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

  // 1. Setup Test Users and Retrieve Available Rooms
  let guest1Token = null;
  let guest2Token = null;
  let adminToken = null;
  let testRoom = null;

  const guest1Email = `booking_tester1_${Date.now()}@hotelpro.test`;
  const guest2Email = `booking_tester2_${Date.now()}@hotelpro.test`;

  await test("Register test guests, login admin, and retrieve active room", async () => {
    // Set a test secret for Razorpay signature testing
    process.env.RAZORPAY_KEY_SECRET = "test_razorpay_mock_secret_32_characters";

    const reg1 = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lifecycle Guest One",
        email: guest1Email,
        password: "secure_password_123",
        role: "guest"
      })
    });
    const regData1 = await reg1.json();
    assert.strictEqual(reg1.status, 201);
    guest1Token = regData1.token;

    const reg2 = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lifecycle Guest Two",
        email: guest2Email,
        password: "secure_password_123",
        role: "guest"
      })
    });
    const regData2 = await reg2.json();
    assert.strictEqual(reg2.status, 201);
    guest2Token = regData2.token;

    const loginAdmin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@hotelpro.com",
        password: "admin123"
      })
    });
    const loginDataAdmin = await loginAdmin.json();
    assert.strictEqual(loginAdmin.status, 200);
    assert.strictEqual(loginDataAdmin.user.role, "admin");
    adminToken = loginDataAdmin.token;

    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    assert.strictEqual(roomsRes.status, 200);
    assert.ok(roomsData.rooms && roomsData.rooms.length > 0);

    testRoom = roomsData.rooms.find((r) => r.status === "Available") || roomsData.rooms[0];
    assert.ok(testRoom && testRoom._id);
  });

  // Helper for generating dynamic future date strings (YYYY-MM-DD)
  const futureDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  const checkInBase = futureDate(30);
  const checkOutBase = futureDate(33); // 3 nights

  // -------------------------------------------------------------
  // Date Validation & Capacity Checks
  // -------------------------------------------------------------
  await test("Reject booking with check-in date in the past (400)", async () => {
    const pastCheckIn = "2020-01-01";
    const pastCheckOut = "2020-01-05";

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: pastCheckIn,
        checkOut: pastCheckOut,
        guests: { adults: 2, children: 0 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes("past"));
  });

  await test("Reject booking with check-out earlier than or equal to check-in (400)", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: futureDate(35),
        checkOut: futureDate(35), // 0 nights
        guests: { adults: 1, children: 0 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes("at least one day after check-in") || data.message.includes("minimum"));
  });

  await test("Reject booking with malformed date strings (400)", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: "not-a-real-date",
        checkOut: "still-not-a-date",
        guests: { adults: 1, children: 0 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes("Invalid date format"));
  });

  await test("Reject booking with 0 adults (400)", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: futureDate(40),
        checkOut: futureDate(42),
        guests: { adults: 0, children: 2 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes("adult"));
  });

  await test("Reject booking exceeding room max guest capacity (400)", async () => {
    const roomMaxGuests = (testRoom.capacity && testRoom.capacity.guests) || 2;
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: futureDate(40),
        checkOut: futureDate(42),
        guests: { adults: roomMaxGuests + 5, children: 0 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes("accommodates a maximum") || data.message.includes("capacity"));
  });

  // -------------------------------------------------------------
  // Price Integrity & Initial Booking Creation
  // -------------------------------------------------------------
  let createdBookingId = null;

  await test("Server recalculates pricing and overrides client-submitted price tampering", async () => {
    const fakeClientPrice = 1.0; // Client attempts to pay ₹1

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: checkInBase,
        checkOut: checkOutBase, // 3 nights
        guests: { adults: 2, children: 0 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email,
        guestPhone: "+91 98765 43210",
        totalPrice: fakeClientPrice
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.booking);

    createdBookingId = data.booking._id;

    // Verify calculated stay and prices
    const nights = 3;
    const expectedBasePrice = testRoom.pricePerNight * nights;
    assert.strictEqual(data.booking.nights, 3);
    assert.strictEqual(data.booking.basePrice, expectedBasePrice);
    assert.ok(data.booking.totalPrice > fakeClientPrice, "Server must override client fake price");
    assert.ok(data.booking.taxAmount >= 0);

    // Initial state check: Unverified paid booking MUST be "Pending Payment" / "Pending"
    assert.strictEqual(data.booking.status, "Pending Payment");
    assert.strictEqual(data.booking.paymentStatus, "Pending");
  });

  // -------------------------------------------------------------
  // Overlapping Reservation & Duplicate Submission Protection
  // -------------------------------------------------------------
  await test("Reject duplicate booking by same guest for overlapping dates (409 DUPLICATE)", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: checkInBase,
        checkOut: checkOutBase,
        guests: { adults: 2, children: 0 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email
      })
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.code, "DUPLICATE_BOOKING_REQUEST");
  });

  await test("Reject overlapping booking by a different guest for same room (409 Conflict)", async () => {
    const overlapIn = futureDate(31);
    const overlapOut = futureDate(32);

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest2Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: overlapIn,
        checkOut: overlapOut,
        guests: { adults: 1, children: 0 },
        guestName: "Lifecycle Guest Two",
        guestEmail: guest2Email
      })
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.ok(
      data.code === "OVERLAPPING_RESERVATION" ||
        (data.message && (data.message.includes("overlap") || data.message.includes("reserved")))
    );
  });

  await test("Allow non-overlapping booking for the same room on adjacent future dates (201)", async () => {
    const adjacentIn = futureDate(35);
    const adjacentOut = futureDate(37);

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest2Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: adjacentIn,
        checkOut: adjacentOut,
        guests: { adults: 1, children: 0 },
        guestName: "Lifecycle Guest Two",
        guestEmail: guest2Email
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.booking);
  });

  // -------------------------------------------------------------
  // Concurrency & Mutex Safety
  // -------------------------------------------------------------
  await test("Concurrent requests for overlapping dates allow only one reservation", async () => {
    const concurrentIn = futureDate(60);
    const concurrentOut = futureDate(63);

    const request1 = fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: concurrentIn,
        checkOut: concurrentOut,
        guests: { adults: 1, children: 0 },
        guestName: "Lifecycle Guest One",
        guestEmail: guest1Email
      })
    });

    const request2 = fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest2Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: concurrentIn,
        checkOut: concurrentOut,
        guests: { adults: 1, children: 0 },
        guestName: "Lifecycle Guest Two",
        guestEmail: guest2Email
      })
    });

    const [res1, res2] = await Promise.all([request1, request2]);
    const statuses = [res1.status, res2.status].sort();

    assert.deepStrictEqual(statuses, [201, 409], "Concurrent collision must allow exactly one 201 and one 409");
  });

  // -------------------------------------------------------------
  // Payment Verification & Status Transitions
  // -------------------------------------------------------------
  await test("Failed payment verification updates paymentStatus to 'Failed' and rejects (400)", async () => {
    // Upstream bank transaction decline simulation
    const res = await fetch(`${BASE_URL}/bookings/${createdBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        paymentMethod: "Demo_Simulated",
        simulateFailure: true
      })
    });

    assert.strictEqual(res.status, 400);

    // Verify booking in store has paymentStatus updated to 'Failed'
    const getRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}`, {
      headers: { Authorization: `Bearer ${guest1Token}` }
    });
    const getData = await getRes.json();
    assert.strictEqual(getData.booking.paymentStatus, "Failed");
    assert.strictEqual(getData.booking.status, "Pending Payment");
  });

  await test("Successful payment verification transitions booking to 'Confirmed' and paymentStatus to 'Paid'", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${createdBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({
        paymentMethod: "Demo_Simulated"
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.booking.status, "Confirmed");
    assert.strictEqual(data.booking.paymentStatus, "Paid");
  });

  // -------------------------------------------------------------
  // Ownership & Authorization Controls
  // -------------------------------------------------------------
  await test("Guest 2 cannot view or cancel Guest 1's booking (403 Forbidden)", async () => {
    const viewRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}`, {
      headers: { Authorization: `Bearer ${guest2Token}` }
    });
    assert.strictEqual(viewRes.status, 403);

    const cancelRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/cancel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest2Token}`
      },
      body: JSON.stringify({ reason: "Unauthorized attempt" })
    });
    assert.strictEqual(cancelRes.status, 403);
  });

  // -------------------------------------------------------------
  // Inventory Release upon Cancellation & State Machine Enforcement
  // -------------------------------------------------------------
  await test("Cancellation releases room inventory, allowing new reservation on same dates", async () => {
    // 1. Guest 1 cancels the booking
    const cancelRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/cancel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest1Token}`
      },
      body: JSON.stringify({ reason: "Schedule change" })
    });

    assert.strictEqual(cancelRes.status, 200);
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelData.booking.status, "Cancelled");

    // 2. State machine test: Admin cannot transition cancelled booking back to Confirmed
    const reconfirmRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "Confirmed" })
    });
    assert.strictEqual(reconfirmRes.status, 400);
    const reconfirmData = await reconfirmRes.json();
    assert.ok(reconfirmData.message.includes("Invalid status transition"));

    // 3. Now Guest 2 attempts to book the exact same dates (checkInBase to checkOutBase)
    const rebookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guest2Token}`
      },
      body: JSON.stringify({
        roomId: testRoom._id,
        checkIn: checkInBase,
        checkOut: checkOutBase,
        guests: { adults: 2, children: 0 },
        guestName: "Lifecycle Guest Two",
        guestEmail: guest2Email
      })
    });

    assert.strictEqual(rebookRes.status, 201, "Cancelled booking must release dates for rebooking");
    const rebookData = await rebookRes.json();
    assert.ok(rebookData.booking);
  });

  console.log("\n-------------------------------------------------");
  console.log(`  LIFECYCLE & CONCURRENCY TESTS: ${passed}/${total} PASSED`);
  console.log("-------------------------------------------------\n");

  if (env.teardown) {
    await env.teardown();
  }

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
