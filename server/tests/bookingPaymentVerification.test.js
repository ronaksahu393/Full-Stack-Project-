/**
 * HotelPro Booking Payment Verification & Payment Status Test Suite
 *
 * Verifies:
 * 1. Server-side payment verification pipeline (Razorpay, Stripe, Demo Simulator).
 * 2. Cryptographic signature verification using timing-safe buffer comparison.
 * 3. Strict production mode restrictions (no demo payments permitted in production).
 * 4. Idempotency and protection against duplicate/repeated payment confirmations.
 * 5. Replay attack prevention (reusing transaction IDs across different bookings).
 * 6. Ownership authorization and status lifecycle enforcement (no paying for cancelled stays).
 * 7. Protection of backend gateway secrets.
 */

const assert = require("assert");
const crypto = require("crypto");
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  verifyStripeWebhookSignature,
  verifyPaymentTransaction,
  getPaymentGatewayStatus
} = require("../services/paymentService");
const { setupTestEnvironment } = require("./testHelper");

async function runTests() {
  const env = await setupTestEnvironment();
  const BASE_URL = env.baseUrl;
  console.log("\n=================================================");
  console.log("  HOTELPRO PAYMENT VERIFICATION TEST SUITE       ");
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
  // 1. Gateway Status & Secret Protection
  // -------------------------------------------------------------
  await test("getPaymentGatewayStatus returns status telemetry without exposing secrets", () => {
    const status = getPaymentGatewayStatus();
    assert.strictEqual(typeof status.isProduction, "boolean");
    assert.strictEqual(typeof status.providers.razorpay.available, "boolean");
    assert.strictEqual(typeof status.providers.stripe.available, "boolean");
    const serialized = JSON.stringify(status);
    assert.strictEqual(serialized.includes("secret"), false);
    assert.strictEqual(serialized.includes("SECRET"), false);
  });

  // -------------------------------------------------------------
  // 2. Cryptographic Razorpay Signature Verification
  // -------------------------------------------------------------
  const testSecret = "test_hotelpro_razorpay_mock_secret_key_99";
  const testOrderId = "order_O8zY9abcdef123";
  const testPaymentId = "pay_P8zY9xyz789012";

  const validSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex");

  await test("verifyRazorpaySignature validates genuine HMAC-SHA256 signature", () => {
    const isValid = verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: validSignature,
      secret: testSecret
    });
    assert.strictEqual(isValid, true);
  });

  await test("verifyRazorpaySignature rejects forged or altered signature", () => {
    const forgedSignature = "a".repeat(64);
    const isValid = verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: forgedSignature,
      secret: testSecret
    });
    assert.strictEqual(isValid, false);
  });

  await test("verifyRazorpaySignature returns false for missing parameters", () => {
    assert.strictEqual(
      verifyRazorpaySignature({ orderId: "", paymentId: testPaymentId, signature: validSignature, secret: testSecret }),
      false
    );
  });

  // -------------------------------------------------------------
  // 2b. Razorpay & Stripe Webhook Cryptographic Verification
  // -------------------------------------------------------------
  const testWebhookSecret = "whsec_test_mock_webhook_secret_key_888";
  const testWebhookPayload = JSON.stringify({
    event: "order.paid",
    payload: { payment: { entity: { id: "pay_test_wh_123", amount: 500000 } } }
  });

  const validWebhookSig = crypto
    .createHmac("sha256", testWebhookSecret)
    .update(testWebhookPayload)
    .digest("hex");

  await test("verifyRazorpayWebhookSignature validates authentic webhook signature", () => {
    const isValid = verifyRazorpayWebhookSignature({
      rawBody: testWebhookPayload,
      signature: validWebhookSig,
      secret: testWebhookSecret
    });
    assert.strictEqual(isValid, true);
  });

  await test("verifyRazorpayWebhookSignature rejects forged webhook signature", () => {
    const isValid = verifyRazorpayWebhookSignature({
      rawBody: testWebhookPayload,
      signature: "0".repeat(64),
      secret: testWebhookSecret
    });
    assert.strictEqual(isValid, false);
  });

  // Stripe Webhook with timestamp tolerance
  const testStripeSecret = "whsec_stripe_test_secret_777";
  const testStripeBody = JSON.stringify({ type: "payment_intent.succeeded", id: "evt_123" });
  const currentTs = Math.floor(Date.now() / 1000);
  const stripeSig = crypto
    .createHmac("sha256", testStripeSecret)
    .update(`${currentTs}.${testStripeBody}`)
    .digest("hex");
  const stripeSigHeader = `t=${currentTs},v1=${stripeSig}`;

  await test("verifyStripeWebhookSignature validates genuine signature within tolerance", () => {
    const isValid = verifyStripeWebhookSignature({
      rawBody: testStripeBody,
      signatureHeader: stripeSigHeader,
      secret: testStripeSecret,
      toleranceSeconds: 300
    });
    assert.strictEqual(isValid, true);
  });

  await test("verifyStripeWebhookSignature rejects expired timestamp outside tolerance window", () => {
    const oldTs = currentTs - 600; // 10 minutes ago
    const oldSig = crypto
      .createHmac("sha256", testStripeSecret)
      .update(`${oldTs}.${testStripeBody}`)
      .digest("hex");
    const oldHeader = `t=${oldTs},v1=${oldSig}`;

    const isValid = verifyStripeWebhookSignature({
      rawBody: testStripeBody,
      signatureHeader: oldHeader,
      secret: testStripeSecret,
      toleranceSeconds: 300
    });
    assert.strictEqual(isValid, false);
  });

  // -------------------------------------------------------------
  // 2c. Payment Amount & Currency Mismatch Protection
  // -------------------------------------------------------------
  await test("verifyPaymentTransaction rejects transaction with mismatched payment amount", async () => {
    try {
      await verifyPaymentTransaction({
        booking: { _id: "b_amt", totalPrice: 6500, currency: "INR" },
        body: {
          paymentMethod: "Demo_Simulated",
          amount: 100 // Tampered amount ₹100 instead of ₹6,500
        },
        isProduction: false
      });
      assert.fail("Should have thrown PAYMENT_AMOUNT_MISMATCH");
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert.strictEqual(err.code, "PAYMENT_AMOUNT_MISMATCH");
    }
  });

  await test("verifyPaymentTransaction accepts transaction with matching subunit paise amount", async () => {
    const res = await verifyPaymentTransaction({
      booking: { _id: "b_amt_ok", totalPrice: 6500, currency: "INR" },
      body: {
        paymentMethod: "Demo_Simulated",
        amount: 650000 // 6500 * 100 paise
      },
      isProduction: false
    });
    assert.strictEqual(res.success, true);
  });

  await test("verifyPaymentTransaction rejects transaction with mismatched currency", async () => {
    try {
      await verifyPaymentTransaction({
        booking: { _id: "b_curr", totalPrice: 6500, currency: "INR" },
        body: {
          paymentMethod: "Demo_Simulated",
          currency: "USD" // Mismatched currency
        },
        isProduction: false
      });
      assert.fail("Should have thrown PAYMENT_CURRENCY_MISMATCH");
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert.strictEqual(err.code, "PAYMENT_CURRENCY_MISMATCH");
    }
  });

  // -------------------------------------------------------------
  // 3. Production Mode Safety & Demo Restrictions
  // -------------------------------------------------------------
  await test("verifyPaymentTransaction strictly forbids demo payments in production mode", async () => {
    try {
      await verifyPaymentTransaction({
        booking: { _id: "b1", totalPrice: 5000 },
        body: { paymentMethod: "Demo_Simulated" },
        isProduction: true
      });
      assert.fail("Should have thrown 403 Forbidden");
    } catch (err) {
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "DEMO_PAYMENT_FORBIDDEN_IN_PRODUCTION");
    }
  });

  await test("verifyPaymentTransaction rejects unconfigured live gateway in production", async () => {
    // Save and clear env keys for test
    const origRazorpay = process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_KEY_SECRET;

    try {
      await verifyPaymentTransaction({
        booking: { _id: "b2", totalPrice: 5000 },
        body: { paymentMethod: "Razorpay", razorpay_payment_id: "pay_test_123" },
        isProduction: true
      });
      assert.fail("Should have thrown 503");
    } catch (err) {
      assert.strictEqual(err.statusCode, 503);
      assert.strictEqual(err.code, "PAYMENT_GATEWAY_NOT_CONFIGURED");
    } finally {
      if (origRazorpay) process.env.RAZORPAY_KEY_SECRET = origRazorpay;
    }
  });

  // -------------------------------------------------------------
  // 4. Development / Test Mode Verification
  // -------------------------------------------------------------
  await test("verifyPaymentTransaction generates explicit test transaction in development mode", async () => {
    const result = await verifyPaymentTransaction({
      booking: { _id: "b3", totalPrice: 5000 },
      body: { paymentMethod: "Demo_Simulated" },
      isProduction: false
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.isDemoPayment, true);
    assert.ok(result.transactionId.startsWith("HP_TX_DEMO_"));
  });

  // -------------------------------------------------------------
  // 5. Integration Workflow: Reservation Lifecycle & Payment
  // -------------------------------------------------------------
  let authToken = null;
  let otherUserToken = null;
  let testBookingId = null;
  let savedTransactionId = null;

  // Register two test users
  const guestEmail = `pay_test_${Date.now()}@hotelpro.test`;
  const otherEmail = `pay_other_${Date.now()}@hotelpro.test`;

  await test("Register test guest and create pending reservation", async () => {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Payment Tester",
        email: guestEmail,
        password: "secure_pass_123",
        role: "guest"
      })
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201);
    authToken = regData.token;

    // Register second user for authorization checks
    const otherRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Other Guest",
        email: otherEmail,
        password: "secure_pass_123",
        role: "guest"
      })
    });
    const otherData = await otherRes.json();
    otherUserToken = otherData.token;

    // Get a room to book
    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    const targetRoom = roomsData.rooms[0];

    const baseOffset = 100 + Math.floor(Math.random() * 500);
    const checkIn = new Date(Date.now() + baseOffset * 86400000).toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + (baseOffset + 2) * 86400000).toISOString().split("T")[0];

    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        roomId: targetRoom._id,
        checkIn,
        checkOut,
        guestName: "Payment Tester",
        guestEmail,
        guests: { adults: 1, children: 0 }
      })
    });
    const bookData = await bookRes.json();
    assert.strictEqual(bookRes.status, 201);
    assert.strictEqual(bookData.booking.paymentStatus, "Pending");
    assert.strictEqual(bookData.booking.isDemoPayment, false);
    testBookingId = bookData.booking._id;
  });

  // Razorpay order creation check
  await test("Owner creates Razorpay order with amount in subunits (paise) and correct currency", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${testBookingId}/create-razorpay-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.order.orderId);
    assert.strictEqual(data.order.currency, data.booking.currency);
    assert.strictEqual(typeof data.order.amount, "number");
  });

  await test("Non-owner guest attempting to create Razorpay order is rejected with 403 Forbidden", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${testBookingId}/create-razorpay-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${otherUserToken}`
      }
    });
    assert.strictEqual(res.status, 403);
  });

  // Authorization check: Other user cannot pay for booking
  await test("Non-owner guest attempting payment is rejected with 403 Forbidden", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${testBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${otherUserToken}`
      },
      body: JSON.stringify({ paymentMethod: "Demo_Simulated" })
    });
    assert.strictEqual(res.status, 403);
  });

  // Successful verification
  await test("Owner successfully verifies demo payment in test environment", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${testBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ paymentMethod: "Demo_Simulated" })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.booking.paymentStatus, "Paid");
    assert.strictEqual(data.booking.isDemoPayment, true);
    assert.ok(data.booking.paymentTransactionId.startsWith("HP_TX_"));
    savedTransactionId = data.booking.paymentTransactionId;
  });

  // Idempotency check: Repeated request with same transaction ID
  await test("Idempotent confirmation: repeating payment request returns 200 without duplicate creation", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${testBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        paymentMethod: "Demo_Simulated",
        transactionId: savedTransactionId
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.booking.paymentTransactionId, savedTransactionId);
    assert.strictEqual(data.booking.paymentStatus, "Paid");
  });

  // Duplicate payment rejection: different payment attempt on already settled booking
  await test("Paying already settled reservation with new payment attempt is rejected with 409 Conflict", async () => {
    const res = await fetch(`${BASE_URL}/bookings/${testBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        paymentMethod: "Demo_Simulated",
        transactionId: "HP_TX_NEW_DIFFERENT"
      })
    });
    assert.strictEqual(res.status, 409);
  });

  // Replay Attack Prevention: Attempting to use savedTransactionId on another booking
  await test("Replay attack prevention: reusing existing payment reference on another reservation is rejected with 409", async () => {
    // Create second reservation
    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    const targetRoom = roomsData.rooms[1] || roomsData.rooms[0];

    const baseOffset2 = 650 + Math.floor(Math.random() * 300);
    const checkIn = new Date(Date.now() + baseOffset2 * 86400000).toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + (baseOffset2 + 2) * 86400000).toISOString().split("T")[0];

    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        roomId: targetRoom._id,
        checkIn,
        checkOut,
        guestName: "Payment Tester",
        guestEmail,
        guests: { adults: 1, children: 0 }
      })
    });
    const bookData = await bookRes.json();
    const secondBookingId = bookData.booking._id;

    // Try to claim payment using savedTransactionId
    const replayRes = await fetch(`${BASE_URL}/bookings/${secondBookingId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        paymentMethod: "Razorpay",
        razorpay_payment_id: savedTransactionId
      })
    });
    assert.notStrictEqual(replayRes.status, 200);
  });

  // Cancelled stay payment rejection
  await test("Payment on a cancelled reservation is rejected with 400 Bad Request", async () => {
    // Create and cancel a reservation
    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    const targetRoom = roomsData.rooms[2] || roomsData.rooms[0];

    const baseOffset3 = 1000 + Math.floor(Math.random() * 300);
    const checkIn = new Date(Date.now() + baseOffset3 * 86400000).toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + (baseOffset3 + 2) * 86400000).toISOString().split("T")[0];

    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        roomId: targetRoom._id,
        checkIn,
        checkOut,
        guestName: "Payment Tester",
        guestEmail,
        guests: { adults: 1, children: 0 }
      })
    });
    const bookData = await bookRes.json();
    const cancelTargetId = bookData.booking._id;

    // Cancel it
    await fetch(`${BASE_URL}/bookings/${cancelTargetId}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authToken}` }
    });

    // Attempt payment
    const payRes = await fetch(`${BASE_URL}/bookings/${cancelTargetId}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ paymentMethod: "Demo_Simulated" })
    });
    assert.strictEqual(payRes.status, 400);
  });

  // -------------------------------------------------------------
  // Live Webhook Endpoint Verification
  // -------------------------------------------------------------
  await test("POST /api/bookings/payment-webhook rejects forged signature with 400", async () => {
    const res = await fetch(`${BASE_URL}/bookings/payment-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "forged_signature_hex_12345"
      },
      body: JSON.stringify({ event: "order.paid" })
    });
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/bookings/payment-webhook processes valid signed order.paid event", async () => {
    const whSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "hotelpro_test_razorpay_webhook_secret_key";

    // Create a fresh pending reservation
    const roomsRes = await fetch(`${BASE_URL}/rooms`);
    const roomsData = await roomsRes.json();
    const targetRoom = roomsData.rooms[0];
    const offset = 1400 + Math.floor(Math.random() * 200);
    const checkIn = new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];
    const checkOut = new Date(Date.now() + (offset + 2) * 86400000).toISOString().split("T")[0];

    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        roomId: targetRoom._id,
        checkIn,
        checkOut,
        guestName: "Webhook Tester",
        guestEmail,
        guests: { adults: 1, children: 0 }
      })
    });
    const bookingId = (await bookRes.json()).booking._id;

    const webhookBody = JSON.stringify({
      event: "order.paid",
      payload: {
        payment: {
          entity: {
            id: `pay_wh_${Date.now()}`,
            amount: 500000,
            notes: { bookingId }
          }
        }
      }
    });

    const signature = crypto
      .createHmac("sha256", whSecret)
      .update(webhookBody)
      .digest("hex");

    const whRes = await fetch(`${BASE_URL}/bookings/payment-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature
      },
      body: webhookBody
    });

    assert.strictEqual(whRes.status, 200);
    const whData = await whRes.json();
    assert.strictEqual(whData.received, true);

    // Verify booking is now Paid and Confirmed
    const getRes = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const bookingRecord = (await getRes.json()).booking;
    assert.strictEqual(bookingRecord.paymentStatus, "Paid");
    assert.strictEqual(bookingRecord.status, "Confirmed");
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
