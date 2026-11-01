import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import { COUNTRIES, DEFAULT_COUNTRY } from "./countries.js";

/**
 * Validates a national or international phone number for a given country.
 *
 * @param {string} rawNumber - The national number or full number entered by user
 * @param {object} country - Selected country object from COUNTRIES (e.g., { iso2: 'IN', dialCode: '+91' })
 * @returns {{ isValid: boolean, error: string | null, formatted: string, e164: string }}
 */
export function validateAndFormatPhone(rawNumber, country = DEFAULT_COUNTRY) {
  if (!rawNumber || !rawNumber.trim()) {
    return {
      isValid: false,
      error: "Phone number is required.",
      formatted: "",
      e164: ""
    };
  }

  const cleanInput = rawNumber.trim();
  const iso2 = country.iso2 || "IN";

  // Build test number: if user already typed leading +, test as-is; otherwise prepend dial code
  const fullNumberCandidate = cleanInput.startsWith("+")
    ? cleanInput
    : `${country.dialCode}${cleanInput.replace(/^0+/, "")}`; // strip leading trunk prefix if present

  try {
    const phoneNumber = parsePhoneNumber(fullNumberCandidate, iso2);

    if (phoneNumber && phoneNumber.isValid()) {
      return {
        isValid: true,
        error: null,
        formatted: phoneNumber.formatInternational(), // e.g., "+91 98765 43210" or "+1 555 234 5678"
        e164: phoneNumber.format("E.164") // e.g., "+919876543210"
      };
    }

    // Number is not valid according to the country's numbering plan
    return {
      isValid: false,
      error: `Please enter a valid phone number for ${country.name}.`,
      formatted: fullNumberCandidate,
      e164: fullNumberCandidate.replace(/\s+/g, "")
    };
  } catch (err) {
    // If parsePhoneNumber threw an error (e.g. INVALID_COUNTRY or TOO_SHORT)
    return {
      isValid: false,
      error: `Invalid phone format for ${country.name}. Check the number and try again.`,
      formatted: fullNumberCandidate,
      e164: fullNumberCandidate.replace(/\s+/g, "")
    };
  }
}

/**
 * Extracts the best matching country and national number from an existing phone string.
 *
 * @param {string} phone - Existing phone string (e.g. from user profile "+1 (555) 234-8901")
 * @returns {{ country: object, nationalNumber: string }}
 */
export function parseInitialPhone(phone) {
  if (!phone || typeof phone !== "string") {
    return { country: DEFAULT_COUNTRY, nationalNumber: "" };
  }

  const trimmed = phone.trim();

  // Try parsing with libphonenumber directly if starts with '+'
  if (trimmed.startsWith("+")) {
    try {
      const parsed = parsePhoneNumber(trimmed);
      if (parsed && parsed.country) {
        const found = COUNTRIES.find((c) => c.iso2 === parsed.country);
        if (found) {
          return {
            country: found,
            nationalNumber: parsed.nationalNumber
          };
        }
      }
    } catch (e) {
      // Fall through to manual match
    }

    // Fallback: search by longest matching dialCode in COUNTRIES
    const matchingCountries = COUNTRIES.filter((c) => trimmed.startsWith(c.dialCode)).sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    );

    if (matchingCountries.length > 0) {
      const bestMatch = matchingCountries[0];
      return {
        country: bestMatch,
        nationalNumber: trimmed.slice(bestMatch.dialCode.length).trim()
      };
    }
  }

  return { country: DEFAULT_COUNTRY, nationalNumber: trimmed };
}
