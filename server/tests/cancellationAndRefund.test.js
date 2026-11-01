/**
 * HotelPro Booking Cancellation and Refund Workflow Test Suite
 *
 * Verifies:
 * 1. Separation of booking cancellation status from payment refund status.
 * 2. Refund is NOT marked as completed merely because cancellation is accepted (starts as Pending).
 * 3. Validation of booking ownership, cancellation eligibility (48h policy), and status checks.
 * 4. Ineligible cancellations (already cancelled, completed stays) rejected with 400.
 * 5. Successful refund processing through provider transitions refundStatus to 'Completed' and paymentStatus to 'Refunded'.
 * 6. Duplicate refund prevention: repeated refund requests rejected with 409 Conflict.
 * 7. Failed refund handling: upstream failure marks refundStatus as 'Failed' while preserving 'Paid' payment status.
 * 8. Preservation of immutable financial audit log.
 */

const assert = require("assert");
const { setupTestEnvironment } = require("./testHelper");

async function runTests() {
  const env = await setupTestEnvironment();
  const BASE_URL = env.baseUrl;
  console.log("\n=================================================");
  console.log("  HOTELPRO CANCELLATION & REFUND TEST SUITE       ");
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

  // Set up test credentials
  let guestToken = null;
  let otherGuestToken = null;
  let targetRoomId = null;

  const testEmail = `refund_tester_${Date.now()}@hotelpro.test`;
  const otherEmail = `refund_other_${Date.now()}@hotelpro.test`;

  // 1. User Registration & Setup
  await test("Register test guest and retrieve available suite", async () => {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Refund Tester",
        email: testEmail,
        password: "secure_password_123",
        role: "guest"
      })
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201);
    guestToken = regData.token;

    const otherRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Other Guest",
        email: otherEmail,
        password: "secure_password_123",
        role: "guest"
      })
    });
    const otherData = await otherRes.json();
    otherGuestToken = otherData.token;

    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    targetRoomId = roomsData.rooms[0]._id;
    assert.ok(targetRoomId);
  });

  // 2. Cancellation of Unpaid Reservation
  let unpaidBookingId = null;
  await test("Cancellation of unpaid reservation marks refundStatus as 'Not_Applicable' with no refund required", async () => {
    const offset = 200 + Math.floor(Math.random() * 300);
    const checkIn = new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + (offset + 2) * 86400000).toISOString().split("T")[0];

    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn,
        checkOut,
        guestName: "Refund Tester",
        guestEmail: testEmail,
        guests: { adults: 1, children: 0 }
      })
    });
    const bookData = await bookRes.json();
    assert.strictEqual(bookRes.status, 201);
    unpaidBookingId = bookData.booking._id;

    // Cancel unpaid reservation
    const cancelRes = await fetch(`${BASE_URL}/bookings/${unpaidBookingId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelData.booking.status, "Cancelled");
    assert.strictEqual(cancelData.booking.paymentStatus, "Pending");
    assert.strictEqual(cancelData.booking.refundStatus, "Not_Applicable");
    assert.strictEqual(cancelData.booking.refundAmount, 0);
    assert.ok(cancelData.message.includes("No payment was captured"));
  });

  // 3. Ownership Protection
  await test("Non-owner guest attempting to cancel reservation is rejected with 403 Forbidden", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${unpaidBookingId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${otherGuestToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  // 4. Repeated Cancellation Rejection
  await test("Ineligible cancellation: cancelling an already cancelled reservation is rejected with 400 Bad Request", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${unpaidBookingId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes("already cancelled"));
  });

  // 5. Eligible Cancellation of Paid Stay (>48h window)
  let paidBookingId = null;
  let stayPrice = 0;
  await test("Cancellation of paid stay (>48h window) sets status: 'Cancelled', paymentStatus: 'Refund Pending', and refundStatus: 'Pending'", async () => {
    const offset = 600 + Math.floor(Math.random() * 300);
    const checkIn = new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + (offset + 3) * 86400000).toISOString().split("T")[0];

    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn,
        checkOut,
        guestName: "Refund Tester",
        guestEmail: testEmail,
        guests: { adults: 1, children: 0 }
      })
    });
    const bookData = await bookRes.json();
    paidBookingId = bookData.booking._id;
    stayPrice = bookData.booking.totalPrice;

    // Verify payment
    const payRes = await fetch(`${BASE_URL}/bookings/${paidBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({ paymentMethod: "Demo_Simulated" })
    });
    const payData = await payRes.json();
    assert.strictEqual(payRes.status, 200);
    assert.strictEqual(payData.booking.paymentStatus, "Paid");

    // Cancel the paid booking
    const cancelRes = await fetch(`${BASE_URL}/bookings/${paidBookingId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelRes.status, 200);

    // Crucial: Cancellation status is separate from refund status!
    assert.strictEqual(cancelData.booking.status, "Cancelled");
    assert.strictEqual(cancelData.booking.paymentStatus, "Refund Pending");
    assert.strictEqual(cancelData.booking.refundStatus, "Pending");
    assert.strictEqual(cancelData.booking.refundAmount, stayPrice);
    assert.notStrictEqual(cancelData.booking.refundStatus, "Completed");
  });

  // 6. Attempting Refund on Active (Uncancelled) Booking
  await test("Attempting to process refund on an active reservation is rejected with 400 Bad Request", async () => {
    const offset = 1000 + Math.floor(Math.random() * 300);
    const checkIn = new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + (offset + 2) * 86400000).toISOString().split("T")[0];

    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({
        roomId: targetRoomId,
        checkIn,
        checkOut,
        guestName: "Refund Tester",
        guestEmail: testEmail,
        guests: { adults: 1, children: 0 }
      })
    });
    const activeBookingId = (await bookRes.json()).booking._id;

    const refundRes = await fetch(`${BASE_URL}/bookings/${activeBookingId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      }
    });
    assert.strictEqual(refundRes.status, 400);
    const data = await refundRes.json();
    assert.strictEqual(data.code, "BOOKING_NOT_CANCELLED");
  });

  // 7. Failed Refund Handling
  await test("Upstream gateway failure marks refundStatus: 'Failed' while preserving paymentStatus: 'Paid'", async () => {
    const failRes = await fetch(`${BASE_URL}/bookings/${paidBookingId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      },
      body: JSON.stringify({ simulateFailure: true })
    });
    assert.strictEqual(failRes.status, 400);
    const failData = await failRes.json();
    assert.strictEqual(failData.code, "REFUND_FAILED");
    assert.strictEqual(failData.booking.refundStatus, "Failed");
    assert.strictEqual(failData.booking.paymentStatus, "Paid"); // Still paid; refund failed!
  });

  // 8. Successful Refund Processing
  let refundTxId = null;
  await test("Successful refund processing transitions refundStatus: 'Completed', paymentStatus: 'Refunded', and records transaction ID", async () => {
    const successRes = await fetch(`${BASE_URL}/bookings/${paidBookingId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      }
    });
    const successData = await successRes.json();
    assert.strictEqual(successRes.status, 200);
    assert.strictEqual(successData.booking.status, "Cancelled");
    assert.strictEqual(successData.booking.refundStatus, "Completed");
    assert.strictEqual(successData.booking.paymentStatus, "Refunded");
    assert.ok(successData.booking.refundTransactionId.startsWith("HP_RFND_") || successData.booking.refundTransactionId.startsWith("rfnd_"));
    refundTxId = successData.booking.refundTransactionId;
  });

  // 9. Duplicate Refund Prevention
  await test("Duplicate refund prevention: repeated refund requests on settled refund rejected with 409 Conflict", async () => {
    const dupRes = await fetch(`${BASE_URL}/bookings/${paidBookingId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${guestToken}`
      }
    });
    assert.strictEqual(dupRes.status, 409);
    const dupData = await dupRes.json();
    assert.strictEqual(dupData.code, "DUPLICATE_REFUND_REQUEST");
  });

  // 10. Audit Log Preservation
  await test("Refund audit log preserves immutable history of initiation, failure, and settlement", async () => {
    const auditRes = await fetch(`${BASE_URL}/bookings/${paidBookingId}/refund`, {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    const auditData = await auditRes.json();
    assert.strictEqual(auditRes.status, 200);
    assert.strictEqual(auditData.refundStatus, "Completed");
    assert.ok(Array.isArray(auditData.refundAuditLog));
    assert.ok(auditData.refundAuditLog.length >= 3); // INITIATE, FAILED, COMPLETED

    const actions = auditData.refundAuditLog.map((log) => log.action);
    assert.ok(actions.includes("CANCEL_INITIATE_REFUND"));
    assert.ok(actions.includes("REFUND_FAILED"));
    assert.ok(actions.includes("REFUND_COMPLETED"));
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
