/**
 * HotelPro India GST Tax Calculator
 * Compliant with Indian Ministry of Finance / GST Council Hotel Accommodation Tiers:
 * - Tariff < ₹1,000/night: 0% GST (Budget exempt tier)
 * - Tariff ₹1,000 - ₹7,499/night: 12% GST (Mid-range & boutique tier)
 * - Tariff >= ₹7,500/night: 18% GST (Luxury & heritage palace tier)
 */

function calculateIndianHotelTax(pricePerNight, nights = 1, customTaxPercent = null) {
  const price = Math.max(0, Number(pricePerNight) || 0);
  const numNights = Math.max(1, Number(nights) || 1);
  const basePrice = Math.round(price * numNights);

  let gstPercent = 12;
  if (customTaxPercent !== null && customTaxPercent !== undefined && !isNaN(customTaxPercent)) {
    gstPercent = Math.max(0, Number(customTaxPercent));
  } else if (price < 1000) {
    gstPercent = 0;
  } else if (price >= 7500) {
    gstPercent = 18;
  } else {
    gstPercent = 12;
  }

  const taxAmount = Math.round((basePrice * gstPercent) / 100);
  const totalPrice = basePrice + taxAmount;

  return {
    nights: numNights,
    pricePerNight: price,
    basePrice,
    gstPercent,
    taxAmount,
    totalPrice,
    currency: "INR"
  };
}

function calculateBookingPricing(room, nights = 1) {
  if (!room) {
    return {
      nights: Math.max(1, Number(nights) || 1),
      pricePerNight: 0,
      basePrice: 0,
      gstPercent: 0,
      taxAmount: 0,
      totalPrice: 0,
      currency: "INR",
      isINR: true
    };
  }

  const price = Math.max(0, Number(room.pricePerNight) || 0);
  const numNights = Math.max(1, Number(nights) || 1);
  const isINR = room.currency === "INR" || price >= 1000;

  let customTaxPercent = null;
  if (room.taxesAndFees && typeof room.taxesAndFees.gstPercent === "number") {
    customTaxPercent = room.taxesAndFees.gstPercent;
  } else if (room.taxDetails && typeof room.taxDetails.gstPercent === "number") {
    customTaxPercent = room.taxDetails.gstPercent;
  }

  if (isINR) {
    const tax = calculateIndianHotelTax(price, numNights, customTaxPercent);
    return {
      ...tax,
      isINR: true
    };
  }

  // Non-INR international room rates
  const basePrice = Math.round(price * numNights);
  return {
    nights: numNights,
    pricePerNight: price,
    basePrice,
    gstPercent: 0,
    taxAmount: 0,
    totalPrice: basePrice,
    currency: room.currency || "USD",
    isINR: false
  };
}

function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.max(0, Math.round(amount)));
}

module.exports = {
  calculateIndianHotelTax,
  calculateBookingPricing,
  formatINR
};
