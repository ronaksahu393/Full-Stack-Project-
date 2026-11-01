import { formatINR, formatCurrency } from "./currency.js";

/**
 * Calculates complete, transparent booking pricing for any room and stay duration.
 * Compliant with Indian Ministry of Finance / GST Council Hotel Accommodation Tiers:
 * - Tariff < ₹1,000/night: 0% GST (Budget exempt tier)
 * - Tariff ₹1,000 - ₹7,499/night: 12% GST (Mid-range & boutique tier)
 * - Tariff >= ₹7,500/night: 18% GST (Luxury & heritage palace tier)
 *
 * @param {object} room - Selected room model object
 * @param {number} nights - Validated duration of stay in nights
 * @returns {object} Full pricing breakdown
 */
export function calculateBookingPrice(room, nights = 1) {
  if (!room) {
    return {
      nights: Math.max(1, Number(nights) || 1),
      pricePerNight: 0,
      basePrice: 0,
      gstPercent: 0,
      taxAmount: 0,
      totalPrice: 0,
      currency: "INR",
      isINR: true,
      includedServices: []
    };
  }

  const price = Math.max(0, Number(room.pricePerNight) || 0);
  const numNights = Math.max(1, Number(nights) || 1);
  const isINR = room.currency === "INR" || price >= 1000;
  const basePrice = Math.round(price * numNights);

  // Check custom room tax override if provided by inventory provider or model
  let gstPercent = 12;
  if (room.taxesAndFees && typeof room.taxesAndFees.gstPercent === "number") {
    gstPercent = room.taxesAndFees.gstPercent;
  } else if (room.taxDetails && typeof room.taxDetails.gstPercent === "number") {
    gstPercent = room.taxDetails.gstPercent;
  } else if (price < 1000) {
    gstPercent = 0;
  } else if (price >= 7500) {
    gstPercent = 18;
  } else {
    gstPercent = 12;
  }

  // Calculate tax amount and final payable
  const taxAmount = isINR ? Math.round((basePrice * gstPercent) / 100) : 0;
  const totalPrice = basePrice + taxAmount;

  // Determine included services from room and hotel amenities
  const amenitiesList = Array.isArray(room.amenities) ? room.amenities : [];
  const includedServices = [
    { name: "Complimentary Valet & High-Speed Wi-Fi", cost: 0, label: "Included" },
    { name: "Dedicated Concierge Desk Liaison", cost: 0, label: "Included" }
  ];

  if (amenitiesList.length > 0) {
    // Add up to two prominent room inclusions if available
    const keyAmenities = amenitiesList.slice(0, 2);
    keyAmenities.forEach((amenity) => {
      includedServices.push({
        name: amenity,
        cost: 0,
        label: "Included"
      });
    });
  }

  return {
    nights: numNights,
    pricePerNight: price,
    basePrice,
    gstPercent: isINR ? gstPercent : 0,
    taxAmount,
    totalPrice,
    currency: isINR ? "INR" : (room.currency || "USD"),
    isINR,
    includedServices
  };
}

export { formatINR, formatCurrency };
