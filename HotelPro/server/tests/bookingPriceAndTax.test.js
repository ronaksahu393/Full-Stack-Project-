/**
 * HotelPro Booking Price Summary & Tax Accuracy Test Suite
 * Tests one-night and multi-night stays, Indian GST tiers, date ranges, rounding, and tamper prevention.
 */

const assert = require("assert");
const { calculateIndianHotelTax, calculateBookingPricing } = require("../utils/taxCalculator");

console.log("=================================================");
console.log("  HOTELPRO BOOKING PRICE & TAX ACCURACY SUITE   ");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// 1. One-Night Stay - Boutique Tier (12% GST)
test("One-night stay at ₹6,500 applies 12% GST and rounds accurately", () => {
  const room = { pricePerNight: 6500, currency: "INR" };
  const res = calculateBookingPricing(room, 1);
  assert.strictEqual(res.nights, 1);
  assert.strictEqual(res.pricePerNight, 6500);
  assert.strictEqual(res.basePrice, 6500, "Base price must be 1 * 6500 = 6500");
  assert.strictEqual(res.gstPercent, 12, "GST rate must be 12% for ₹6,500 (< ₹7,500)");
  assert.strictEqual(res.taxAmount, 780, "Tax must be 12% of 6500 = 780");
  assert.strictEqual(res.totalPrice, 7280, "Total must be 6500 + 780 = 7280");
});

// 2. Multi-Night Stay - Boutique Tier (12% GST)
test("Three-night stay at ₹4,500 computes room subtotal and 12% tax", () => {
  const room = { pricePerNight: 4500, currency: "INR" };
  const res = calculateBookingPricing(room, 3);
  assert.strictEqual(res.nights, 3);
  assert.strictEqual(res.pricePerNight, 4500);
  assert.strictEqual(res.basePrice, 13500, "Base price must be 3 * 4500 = 13500");
  assert.strictEqual(res.gstPercent, 12);
  assert.strictEqual(res.taxAmount, 1620, "Tax must be 12% of 13500 = 1620");
  assert.strictEqual(res.totalPrice, 15120, "Total must be 13500 + 1620 = 15120");
});

// 3. Luxury Palace Tier - 18% GST (Tariff >= ₹7,500)
test("Two-night stay at ₹14,500 applies 18% GST luxury tier", () => {
  const room = { pricePerNight: 14500, currency: "INR" };
  const res = calculateBookingPricing(room, 2);
  assert.strictEqual(res.nights, 2);
  assert.strictEqual(res.basePrice, 29000, "Base price must be 2 * 14500 = 29000");
  assert.strictEqual(res.gstPercent, 18, "GST rate must be 18% for ₹14,500 (>= ₹7,500)");
  assert.strictEqual(res.taxAmount, 5220, "Tax must be 18% of 29000 = 5220");
  assert.strictEqual(res.totalPrice, 34220, "Total must be 29000 + 5220 = 34220");
});

// 4. Budget Exempt Tier - 0% GST (Tariff < ₹1,000)
test("One-night stay at ₹850 is GST-exempt (0% GST)", () => {
  const room = { pricePerNight: 850, currency: "INR" };
  const res = calculateBookingPricing(room, 1);
  assert.strictEqual(res.basePrice, 850);
  assert.strictEqual(res.gstPercent, 0, "GST rate must be 0% for tariff under ₹1,000");
  assert.strictEqual(res.taxAmount, 0, "Tax amount must be 0");
  assert.strictEqual(res.totalPrice, 850, "Total must equal base price ₹850");
});

// 5. Custom GST Override on Room Model
test("Custom GST override on room model is honored", () => {
  const room = {
    pricePerNight: 5000,
    currency: "INR",
    taxesAndFees: { gstPercent: 5 }
  };
  const res = calculateBookingPricing(room, 2);
  assert.strictEqual(res.basePrice, 10000);
  assert.strictEqual(res.gstPercent, 5, "Custom GST override of 5% must be used");
  assert.strictEqual(res.taxAmount, 500, "Tax must be 5% of 10000 = 500");
  assert.strictEqual(res.totalPrice, 10500, "Total must be 10000 + 500 = 10500");
});

// 6. Rounding of fractional tax amounts
test("Odd room rate rounds fractional taxes to nearest integer without floating-point artifacts", () => {
  const room = { pricePerNight: 3333, currency: "INR" }; // 12% of 3333 = 399.96
  const res = calculateBookingPricing(room, 1);
  assert.strictEqual(res.basePrice, 3333);
  assert.strictEqual(res.taxAmount, 400, "399.96 must round to 400");
  assert.strictEqual(res.totalPrice, 3733, "Total must be 3333 + 400 = 3733");
});

// 7. Non-INR Foreign Currency Stay (e.g. $420 UK Pavilion Suite)
test("Non-INR international room rates compute without Indian GST", () => {
  const room = { pricePerNight: 420, currency: "USD" };
  const res = calculateBookingPricing(room, 3);
  assert.strictEqual(res.isINR, false);
  assert.strictEqual(res.currency, "USD");
  assert.strictEqual(res.basePrice, 1260, "3 * 420 = 1260");
  assert.strictEqual(res.gstPercent, 0);
  assert.strictEqual(res.taxAmount, 0);
  assert.strictEqual(res.totalPrice, 1260, "Total must equal 1260 USD");
});

// 8. Date Duration Re-calculation (Date Changes)
test("Changing duration from 1 night to 4 nights scales subtotal and tax proportionally", () => {
  const room = { pricePerNight: 5000, currency: "INR" };
  const oneNight = calculateBookingPricing(room, 1);
  const fourNights = calculateBookingPricing(room, 4);

  assert.strictEqual(oneNight.basePrice, 5000);
  assert.strictEqual(oneNight.taxAmount, 600);
  assert.strictEqual(oneNight.totalPrice, 5600);

  assert.strictEqual(fourNights.basePrice, 20000);
  assert.strictEqual(fourNights.taxAmount, 2400);
  assert.strictEqual(fourNights.totalPrice, 22400);

  assert.strictEqual(fourNights.basePrice, oneNight.basePrice * 4);
  assert.strictEqual(fourNights.taxAmount, oneNight.taxAmount * 4);
});

// 9. Negative Price and Zero Protection
test("Negative or zero prices are protected and bounded to 0", () => {
  const room = { pricePerNight: -1500, currency: "INR" };
  const res = calculateBookingPricing(room, 2);
  assert.strictEqual(res.pricePerNight, 0, "Negative price must be bounded to 0");
  assert.strictEqual(res.basePrice, 0);
  assert.strictEqual(res.taxAmount, 0);
  assert.strictEqual(res.totalPrice, 0);
});

// 10. Direct Indian Tax Calculator Utility Consistency
test("calculateIndianHotelTax function matches calculateBookingPricing for INR", () => {
  const direct = calculateIndianHotelTax(7500, 2);
  const viaPricing = calculateBookingPricing({ pricePerNight: 7500, currency: "INR" }, 2);

  assert.strictEqual(direct.basePrice, viaPricing.basePrice);
  assert.strictEqual(direct.gstPercent, viaPricing.gstPercent);
  assert.strictEqual(direct.taxAmount, viaPricing.taxAmount);
  assert.strictEqual(direct.totalPrice, viaPricing.totalPrice);
});

console.log("\n-------------------------------------------------");
console.log(`  SUMMARY: ${passed} / ${passed + failed} tests passed successfully.`);
console.log("-------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
