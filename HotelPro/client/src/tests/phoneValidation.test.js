import { COUNTRIES, DEFAULT_COUNTRY } from "../utils/countries.js";
import { validateAndFormatPhone, parseInitialPhone } from "../utils/phoneValidation.js";

console.log("=================================================");
console.log("  HOTELPRO INTERNATIONAL PHONE INPUT TEST SUITE  ");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

// 1. Default country is India (+91)
assert(DEFAULT_COUNTRY.iso2 === "IN", "Default country ISO-2 is 'IN'");
assert(DEFAULT_COUNTRY.dialCode === "+91", "Default country dial code is '+91'");
assert(DEFAULT_COUNTRY.name === "India", "Default country name is 'India'");
assert(DEFAULT_COUNTRY.flag === "🇮🇳", "Default country flag is '🇮🇳'");

// 2. Comprehensive country dataset
assert(COUNTRIES.length >= 50, `Country list contains ${COUNTRIES.length} countries (comprehensive >= 50)`);

// 3. Countries sharing the same dial code (US and Canada)
const us = COUNTRIES.find((c) => c.iso2 === "US");
const ca = COUNTRIES.find((c) => c.iso2 === "CA");
assert(us && ca, "Both US and Canada exist in dataset");
assert(us.dialCode === "+1" && ca.dialCode === "+1", "US and Canada both share dial code '+1'");
assert(us.iso2 !== ca.iso2, "US and Canada have distinct ISO-2 codes for correct metadata routing");

// 4. Valid Indian phone number
const validIndia = validateAndFormatPhone("9876543210", DEFAULT_COUNTRY);
assert(validIndia.isValid === true, "Valid 10-digit Indian mobile is accepted");
assert(validIndia.formatted === "+91 98765 43210", `Formatted as international: '${validIndia.formatted}'`);
assert(validIndia.e164 === "+919876543210", `E.164 normalized: '${validIndia.e164}'`);

// 5. Invalid Indian phone number (too short or invalid starting digit)
const shortIndia = validateAndFormatPhone("98765", DEFAULT_COUNTRY);
assert(shortIndia.isValid === false, "Too short Indian number is rejected");
assert(shortIndia.error.includes("India"), "Error message explicitly names India");

const invalidLeadIndia = validateAndFormatPhone("0000000000", DEFAULT_COUNTRY);
assert(invalidLeadIndia.isValid === false, "Indian number with all zeroes is rejected");

// 6. Valid US phone number
const validUS = validateAndFormatPhone("4155552671", us);
assert(validUS.isValid === true, "Valid US phone number is accepted");
assert(validUS.formatted.startsWith("+1"), "US formatted number starts with +1");

// 7. Invalid US phone number (invalid area code starting with 0 or 1)
const invalidAreaUS = validateAndFormatPhone("0123456789", us);
assert(invalidAreaUS.isValid === false, "US number starting with 0 area code is rejected");

// 8. Valid UK phone number
const uk = COUNTRIES.find((c) => c.iso2 === "GB");
const validUK = validateAndFormatPhone("7911123456", uk);
assert(validUK.isValid === true, "Valid UK mobile starting with 7 is accepted");
assert(validUK.formatted.startsWith("+44"), "UK formatted number starts with +44");

// 9. Valid UAE phone number
const uae = COUNTRIES.find((c) => c.iso2 === "AE");
const validUAE = validateAndFormatPhone("501234567", uae);
assert(validUAE.isValid === true, "Valid UAE mobile starting with 50 is accepted");
assert(validUAE.formatted.startsWith("+971"), "UAE formatted number starts with +971");

// 10. Valid Australia phone number
const au = COUNTRIES.find((c) => c.iso2 === "AU");
const validAU = validateAndFormatPhone("412345678", au);
assert(validAU.isValid === true, "Valid Australian mobile starting with 4 is accepted");
assert(validAU.formatted.startsWith("+61"), "AU formatted number starts with +61");

// 11. Initial phone parser preserves country and separates national number
const parsedProfileUS = parseInitialPhone("+1 (555) 234-8901");
assert(parsedProfileUS.country.iso2 === "US" || parsedProfileUS.country.dialCode === "+1", "Parsed +1 profile phone matches +1 country");

const parsedProfileIN = parseInitialPhone("+91 98765 43210");
assert(parsedProfileIN.country.iso2 === "IN", "Parsed +91 profile phone matches India");
assert(parsedProfileIN.nationalNumber.replace(/\D/g, "") === "9876543210", "Parsed national number contains 9876543210");

// 12. Empty number handling
const emptyCheck = validateAndFormatPhone("", DEFAULT_COUNTRY);
assert(emptyCheck.isValid === false, "Empty phone string returns isValid === false");

console.log("\n-------------------------------------------------");
console.log(`  SUMMARY: ${passed} / ${passed + failed} tests passed successfully.`);
console.log("-------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
