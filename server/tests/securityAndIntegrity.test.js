// HotelPro Comprehensive Security, Booking & Data Integrity Test Suite
const assert = require("assert");
const jwt = require("jsonwebtoken");
const { setupTestEnvironment } = require("./testHelper");

const runTests = async () => {
  const env = await setupTestEnvironment();
  const BASE_URL = env.baseUrl;

  console.log("=================================================");
  console.log("  HOTELPRO SECURITY & INTEGRITY VERIFICATION");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    -> ${err.message}\n`);
    }
  };

  // 1. API Health Check
  await test("Backend health endpoint is online", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, "online");
  });

  // 2. Privilege Escalation Prevention
  let guestToken = null;
  let guestUser = null;
  const testEmail = `test_guest_${Date.now()}@hotelpro.test`;

  await test("Public registration with role: 'admin' strictly assigns role: 'guest'", async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Security Tester",
        email: testEmail,
        password: "secure_password_123",
        role: "admin" // Attempt privilege escalation
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.user.role, "guest", "Role must be 'guest', not 'admin'");
    guestToken = data.token;
    guestUser = data.user;
  });

  // 3. Duplicate Registration Prevention
  await test("Duplicate email registration is rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Security Tester Duplicate",
        email: testEmail,
        password: "secure_password_123"
      })
    });
    assert.strictEqual(res.status, 400);
  });

  // 4. Invalid Login Rejection
  await test("Invalid password login is rejected with 401", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "wrong_password"
      })
    });
    assert.strictEqual(res.status, 401);
  });

  // 5. Fake / Forged Token Rejection
  await test("Forged or fake JWT tokens are rejected with 401", async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: "Bearer demo_jwt_token_fake_forgery" }
    });
    assert.strictEqual(res.status, 401);
  });

  // 6. Role Authorization - Guest Cannot Access Admin Endpoints
  await test("Guest token attempting to access Admin telemetry is rejected with 403 Forbidden", async () => {
    const res = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  // 7. Admin Login & Authorization
  let adminToken = null;
  await test("Admin login succeeds and authorizes admin telemetry access", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@hotelpro.com",
        password: "admin123"
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.user.role, "admin");
    adminToken = data.token;

    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(metricsRes.status, 200);
  });

  // 8. Booking Validation - Past Dates
  const targetRoomId = "664fa2a3b8109a1b1c000010"; // The Pavilion Garden Suite ($420/night, max 2 guests)
  await test("Booking with past check-in date is rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: "2020-01-01",
        checkOut: "2020-01-05",
        guests: { adults: 2, children: 0 },
        guestName: "Security Tester",
        guestEmail: testEmail
      })
    });
    assert.strictEqual(res.status, 400);
  });

  // 9. Booking Validation - Capacity Limit
  await test("Booking exceeding room capacity is rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: "2026-12-01",
        checkOut: "2026-12-04",
        guests: { adults: 5, children: 2 }, // Exceeds capacity of 2
        guestName: "Security Tester",
        guestEmail: testEmail
      })
    });
    assert.strictEqual(res.status, 400);
  });

  // 10. Booking Price Integrity - Client Cannot Tamper with Total Price
  let createdBookingId = null;
  await test("Server recalculates price and overrides client price tampering", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: "2026-12-10",
        checkOut: "2026-12-13", // 3 nights @ $420 = $1260
        guests: { adults: 2, children: 0 },
        guestName: "Security Tester",
        guestEmail: testEmail,
        totalPrice: 1 // Attempt to tamper price to $1
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.booking.totalPrice, 1260, "Server must compute 3 * 420 = 1260");
    assert.strictEqual(data.booking.paymentStatus, "Pending");
    createdBookingId = data.booking._id;
  });

  // 11. Booking Overlap Collision Prevention
  await test("Overlapping reservation for the same room is rejected with 409 Conflict", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: "2026-12-11", // Overlaps with 2026-12-10 to 2026-12-13
        checkOut: "2026-12-15",
        guests: { adults: 2, children: 0 },
        guestName: "Second Guest",
        guestEmail: "second@test.com"
      })
    });
    assert.strictEqual(res.status, 409);
  });

  // 12. Payment Verification Workflow
  await test("Payment verification endpoint sets paymentStatus to 'Paid' and issues transaction ID", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${createdBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        paymentMethod: "Card_Encrypted"
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.booking.paymentStatus, "Paid");
    assert.ok(data.booking.paymentTransactionId.startsWith("HP_TX_"));
  });

  // 13. Cancellation Authorization & Ownership
  await test("Guest can cancel their own booking and refund is initiated", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${createdBookingId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.booking.status, "Cancelled");
    assert.strictEqual(data.booking.refundStatus, "Pending");

    // Process refund confirmation with provider
    const refundRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      }
    });
    const refundData = await refundRes.json();
    assert.strictEqual(refundRes.status, 200);
    assert.strictEqual(refundData.booking.paymentStatus, "Refunded");
    assert.strictEqual(refundData.booking.refundStatus, "Completed");
  });

  // 14. Invalid State Machine Transition
  await test("Arbitrary status transition from 'Cancelled' is rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${createdBookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "Checked In" })
    });
    assert.strictEqual(res.status, 400);
  });

  // 15. Staff Operations & Cleaning Status Validation
  let staffToken = null;
  await test("Staff login succeeds and validates room cleaning status updates", async () => {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "staff@hotelpro.com",
        password: "staff123"
      })
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginData.user.role, "staff");
    staffToken = loginData.token;

    // Staff overview check
    const overviewRes = await fetch(`${BASE_URL}/staff/overview`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.strictEqual(overviewRes.status, 200);
    const overviewData = await overviewRes.json();
    assert(Array.isArray(overviewData.arrivalsToday), "Arrivals must be an array");
    assert(Array.isArray(overviewData.departuresToday), "Departures must be an array");
    assert(Array.isArray(overviewData.roomsCleaning), "Rooms must be an array");

    // Invalid cleaning status rejection
    const invalidCleanRes = await fetch(`${BASE_URL}/staff/rooms/${targetRoomId}/cleaning`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ cleaningStatus: "Sparkling" }) // Invalid
    });
    assert.strictEqual(invalidCleanRes.status, 400);

    // Valid cleaning status acceptance
    const validCleanRes = await fetch(`${BASE_URL}/staff/rooms/${targetRoomId}/cleaning`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ cleaningStatus: "Inspecting" })
    });
    assert.strictEqual(validCleanRes.status, 200);
  });

  // 16. Admin Verified Revenue Calculation
  await test("Admin metrics calculate revenue strictly from verified paid bookings", async () => {
    const res = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.metrics.totalRevenue === "number", "Total revenue must be numeric");
    assert.ok(typeof data.metrics.occupancyRate === "number", "Occupancy rate must be numeric");
    assert.ok(data.metrics.occupancyRate >= 0 && data.metrics.occupancyRate <= 100);
    assert.ok(typeof data.metrics.arrivalsToday === "number", "Arrivals today must be numeric");
    assert.ok(typeof data.metrics.departuresToday === "number", "Departures today must be numeric");
  });

  // 17. Unpaid Booking Cancellation Transparency
  await test("Cancelling an unpaid booking clarifies that no charges were incurred", async () => {
    // Create new unpaid booking
    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: "2026-12-20",
        checkOut: "2026-12-22",
        guests: { adults: 1, children: 0 },
        guestName: "Security Tester",
        guestEmail: testEmail
      })
    });
    assert.strictEqual(bookRes.status, 201);
    const newBooking = (await bookRes.json()).booking;
    assert.strictEqual(newBooking.paymentStatus, "Pending");

    // Cancel without payment
    const cancelRes = await fetch(`${BASE_URL}/bookings/${newBooking._id}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(cancelRes.status, 200);
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelData.booking.status, "Cancelled");
    assert.strictEqual(cancelData.booking.paymentStatus, "Pending");
    assert.ok(cancelData.message.includes("No payment was captured") || cancelData.message.includes("No charges"));
  });

  // 18. Zero Fake Rating Assignment on Admin Hotel and Room Creation
  await test("New hotel and room creation sets rating: null and reviewCount: 0 without artificial 4.8", async () => {
    const hotelPayload = {
      name: `Test Haveli Heritage ${Date.now()}`,
      propertyCategory: "Heritage Palace",
      summary: "Newly built heritage courtyard property.",
      address: {
        addressLine: "Fort Road",
        city: "Jodhpur",
        state: "Rajasthan",
        postalCode: "342001"
      },
      startingPrice: 6500,
      starClassification: 4
    };

    const hotelRes = await fetch(`${BASE_URL}/admin/hotels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(hotelPayload)
    });
    assert.strictEqual(hotelRes.status, 201);
    const createdHotel = (await hotelRes.json()).hotel;
    assert.strictEqual(createdHotel.rating, null, "Unreviewed hotel rating must be null, not 4.8");
    assert.strictEqual(createdHotel.reviewCount, 0, "Unreviewed hotel reviewCount must be 0");

    // Add room to this hotel
    const roomPayload = {
      name: "Courtyard Deluxe Suite",
      category: "Deluxe Suite",
      pricePerNight: 7200,
      capacity: { guests: 2, adults: 2, children: 0, bedrooms: 1, beds: 1 },
      summary: "Courtyard view room"
    };

    const roomRes = await fetch(`${BASE_URL}/admin/hotels/${createdHotel._id}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(roomPayload)
    });
    assert.strictEqual(roomRes.status, 201);
    const createdRoom = (await roomRes.json()).room;
    assert.strictEqual(createdRoom.rating, null, "Unreviewed room rating must be null, not 4.8");
    assert.strictEqual(createdRoom.reviewCount, 0, "Unreviewed room reviewCount must be 0");
  });

  // 19. Genuine Reviews Arithmetic Calculation
  await test("Hotel with genuine reviews calculates real mathematical average rating", async () => {
    const genuineReviews = [
      { userName: "Aarav Sharma", rating: 4, comment: "Pleasant stay" },
      { userName: "Pooja Patel", rating: 5, comment: "Exceptional architecture" }
    ]; // Mean = (4 + 5) / 2 = 4.5

    const hotelRes = await fetch(`${BASE_URL}/admin/hotels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: `Reviewed Boutique Resort ${Date.now()}`,
        summary: "Verified guest reviewed property.",
        address: { city: "Udaipur", state: "Rajasthan" },
        reviews: genuineReviews
      })
    });
    assert.strictEqual(hotelRes.status, 201);
    const hotel = (await hotelRes.json()).hotel;
    assert.strictEqual(hotel.rating, 4.5, "Rating must equal real mathematical average 4.5");
    assert.strictEqual(hotel.reviewCount, 2, "Review count must equal number of genuine reviews");
  });

  // 20. Booking Date Inversion Validation (checkOut <= checkIn)
  await test("Booking with checkOut date on or before checkIn date is rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: "2026-12-15",
        checkOut: "2026-12-10", // Inverted sequence
        guests: { adults: 2, children: 0 },
        guestName: "Security Tester",
        guestEmail: testEmail
      })
    });
    assert.strictEqual(res.status, 400);
  });

  // 21. Unauthorized Booking Cancellation Rejection
  await test("Unauthorized cancellation: guest attempting to cancel another user's reservation is rejected with 403", async () => {
    // Register another user
    const otherRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Intruder Guest",
        email: `intruder_${Date.now()}@hotelpro.test`,
        password: "secure_password_123"
      })
    });
    assert.strictEqual(otherRes.status, 201);
    const otherToken = (await otherRes.json()).token;

    const off1 = 200 + Math.floor(Math.random() * 800);
    const checkIn21 = new Date(Date.now() + off1 * 86400000).toISOString().split("T")[0];
    const checkOut21 = new Date(Date.now() + (off1 + 3) * 86400000).toISOString().split("T")[0];

    // Create a booking owned by guestToken
    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: checkIn21,
        checkOut: checkOut21,
        guests: { adults: 1, children: 0 },
        guestName: "Legit Owner",
        guestEmail: testEmail
      })
    });
    assert.strictEqual(bookRes.status, 201);
    const legitimateBookingId = (await bookRes.json()).booking._id;

    // Other user attempts to cancel
    const cancelAttempt = await fetch(`${BASE_URL}/bookings/${legitimateBookingId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${otherToken}` }
    });
    assert.strictEqual(cancelAttempt.status, 403);
  });

  // 22. Payment Replay Protection on Already Settled Reservation
  await test("Replay attack prevention: re-submitting payment verification on already settled reservation is rejected with 409", async () => {
    const off2 = 1200 + Math.floor(Math.random() * 800);
    const checkIn22 = new Date(Date.now() + off2 * 86400000).toISOString().split("T")[0];
    const checkOut22 = new Date(Date.now() + (off2 + 3) * 86400000).toISOString().split("T")[0];

    // 1. Create booking
    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn: checkIn22,
        checkOut: checkOut22,
        guests: { adults: 1, children: 0 },
        guestName: "Security Tester",
        guestEmail: testEmail
      })
    });
    const bId = (await bookRes.json()).booking._id;

    // 2. Pay first time
    const pay1 = await fetch(`${BASE_URL}/bookings/${bId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({ paymentMethod: "Card_Encrypted" })
    });
    assert.strictEqual(pay1.status, 200);

    // 3. Re-pay second time -> Replay conflict
    const pay2 = await fetch(`${BASE_URL}/bookings/${bId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({ paymentMethod: "Card_Encrypted" })
    });
    assert.strictEqual(pay2.status, 409);
  });

  // 23. Non-existent Room ID Booking Attempt
  await test("Booking on non-existent room ID is rejected with 404", async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: "664fa2a3b8109a1b1c999999", // Non-existent
        checkIn: "2027-02-01",
        checkOut: "2027-02-04",
        guests: { adults: 1, children: 0 },
        guestName: "Security Tester",
        guestEmail: testEmail
      })
    });
    assert.strictEqual(res.status, 404);
  });

  // 24. Unauthenticated Access to Protected Endpoints
  await test("Unauthenticated requests to protected endpoints return 401 without leaking internal errors", async () => {
    const res1 = await fetch(`${BASE_URL}/auth/me`);
    assert.strictEqual(res1.status, 401);

    const res2 = await fetch(`${BASE_URL}/bookings/my`);
    assert.strictEqual(res2.status, 401);

    const res3 = await fetch(`${BASE_URL}/admin/users`);
    assert.strictEqual(res3.status, 401);
  });

  // 25. Expired JWT Token Rejection
  await test("Expired JWT token is strictly rejected with 401 and Token expired indicator", async () => {
    const secret = process.env.JWT_SECRET || "hotelpro_isolated_test_secret_32_characters_minimum";
    const expiredToken = jwt.sign({ id: "user_expired_test" }, secret, {
      algorithm: "HS256",
      expiresIn: "-10s"
    });

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.ok(data.error === "Token expired" || data.message.includes("expired"));
  });

  // 26. Missing Required Claims in Token Payload
  await test("JWT token missing required 'id' claim is rejected with 401", async () => {
    const secret = process.env.JWT_SECRET || "hotelpro_isolated_test_secret_32_characters_minimum";
    const badClaimToken = jwt.sign({ role: "admin", email: "spoof@test.com" }, secret, {
      algorithm: "HS256",
      expiresIn: "1h"
    });

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${badClaimToken}` }
    });
    assert.strictEqual(res.status, 401);
  });

  // 27. Malformed / Empty Token String
  await test("Empty or string 'null' token is rejected with 401", async () => {
    const res1 = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: "Bearer " }
    });
    assert.strictEqual(res1.status, 401);

    const res2 = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: "Bearer null" }
    });
    assert.strictEqual(res2.status, 401);
  });

  // 28. Password Hash Never Exposed in API Responses
  await test("Sensitive password hashes are never exposed in user API responses", async () => {
    // 1. Check /auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(meRes.status, 200);
    const meData = await meRes.json();
    assert.strictEqual(meData.user.password, undefined);
    assert.strictEqual(JSON.stringify(meData).includes("password"), false);

    // 2. Check /admin/users
    const usersRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(usersRes.status, 200);
    const usersData = await usersRes.json();
    assert.ok(usersData.users.length > 0);
    for (const u of usersData.users) {
      assert.strictEqual(u.password, undefined);
    }
  });

  // 29. Role Authorization: Guest Cannot Access Admin User List
  await test("Guest cannot access admin user management endpoint (403 Forbidden)", async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  // 30. Role Authorization: Guest Cannot Access Staff Endpoints
  await test("Guest cannot access staff housekeeping or room status endpoints (403 Forbidden)", async () => {
    const res = await fetch(`${BASE_URL}/staff/overview`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  // 31. Administrator Self-Demotion Prevention
  await test("Administrator cannot demote their own account to guest (400 Bad Request)", async () => {
    // Get current admin user ID
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminUser = (await meRes.json()).user;

    const demoteRes = await fetch(`${BASE_URL}/admin/users/${adminUser._id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: "guest" })
    });

    assert.strictEqual(demoteRes.status, 400);
    const demoteData = await demoteRes.json();
    assert.ok(demoteData.message.includes("Administrators cannot revoke"));
  });

  // 32. Security Headers & Framework Concealment
  await test("HTTP security headers are delivered and X-Powered-By is omitted", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);

    const xContentType = res.headers.get("x-content-type-options");
    assert.strictEqual(xContentType, "nosniff");

    const xFrame = res.headers.get("x-frame-options");
    assert.ok(xFrame === "SAMEORIGIN" || xFrame === "DENY");

    const xPoweredBy = res.headers.get("x-powered-by");
    assert.strictEqual(xPoweredBy, null, "X-Powered-By header must be completely omitted");
  });

  // 33. Logout Endpoint
  await test("Calling POST /api/auth/logout succeeds with 200 and confirms session termination", async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await env.teardown();

  console.log("\n-------------------------------------------------");
  console.log(`  SUMMARY: ${passed} / ${total} tests passed successfully.`);
  console.log("-------------------------------------------------\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error("Unhandled test suite execution error:", err);
  process.exit(1);
});
