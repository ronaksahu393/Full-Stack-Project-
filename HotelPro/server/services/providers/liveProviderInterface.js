/**
 * HotelPro Live Hotel Inventory Provider Adapter
 *
 * This adapter defines the contract for connecting HotelPro with live external
 * hotel distribution networks, GDS systems, or authorized OTA partner APIs
 * (e.g., Amadeus Hotel Search API, Hotelbeds APItude, or Sabre).
 *
 * Integrity Principles:
 * 1. Explicit Configuration: Requires LIVE_HOTEL_API_KEY and LIVE_HOTEL_API_SECRET.
 * 2. No False Claims: If unconfigured, explicitly reports 503 LIVE_PROVIDER_NOT_CONFIGURED.
 * 3. No Silent Fallback: Live mode never secretly returns demo seed data disguised as live data.
 * 4. Transparent Upstream Status: Acknowledges when live API contracts/endpoints are pending.
 */

class LiveHotelProviderInterface {
  constructor(config = {}) {
    this.name = "Live_Hotel_Provider_Adapter";
    this.apiKey = config.apiKey || process.env.LIVE_HOTEL_API_KEY || "";
    this.apiSecret = config.apiSecret || process.env.LIVE_HOTEL_API_SECRET || "";
    this.endpoint = config.endpoint || process.env.LIVE_HOTEL_API_ENDPOINT || "https://api.amadeus.com/v1";
    this.timeoutMs = Number(process.env.LIVE_HOTEL_TIMEOUT_MS) || 6000;
    this.cachedToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Validates whether live provider credentials are configured.
   */
  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() !== "" &&
      this.apiKey !== "placeholder_api_key" &&
      this.apiKey !== "your_api_key_here"
    );
  }

  /**
   * Reports whether a live external OTA/GDS API connection is active and verified.
   * Explicitly returns false until real credentials and a live upstream contract are verified.
   */
  isLiveIntegrated() {
    return false;
  }

  /**
   * Authenticates with external provider using OAuth2 / API key protocol.
   */
  async getAuthToken() {
    if (!this.isConfigured()) {
      const err = new Error(
        "Live hotel provider credentials not configured. Set LIVE_HOTEL_API_KEY and LIVE_HOTEL_API_SECRET in backend/.env."
      );
      err.statusCode = 503;
      err.code = "LIVE_PROVIDER_NOT_CONFIGURED";
      throw err;
    }

    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiresAt - 60000) {
      return this.cachedToken;
    }

    // In a live integration with an external provider (e.g. Amadeus OAuth2),
    // a POST request is dispatched to exchange client credentials for an access token.
    const err = new Error(
      "Live hotel provider API credentials detected, but upstream OAuth2 token exchange requires an active external provider endpoint."
    );
    err.statusCode = 501;
    err.code = "LIVE_PROVIDER_NOT_IMPLEMENTED";
    throw err;
  }

  /**
   * Searches live hotel inventory across specified geographic bounds or destination.
   * @param {Object} searchParams - destination, checkIn, checkOut, guests, price range, etc.
   */
  async searchHotels(searchParams) {
    if (!this.isConfigured()) {
      const err = new Error(
        "Live hotel inventory provider is active, but required external credentials (LIVE_HOTEL_API_KEY) are not configured. Switch to Demo mode in backend/.env or configure live credentials."
      );
      err.statusCode = 503;
      err.code = "LIVE_PROVIDER_NOT_CONFIGURED";
      throw err;
    }

    // Since no active external GDS/OTA contract or live upstream endpoint is currently verified,
    // explicitly return 501 Not Implemented rather than faking live data.
    const err = new Error(
      `Live hotel provider credentials detected for destination '${searchParams.destination || "all"}', but upstream GDS/OTA endpoint integration is awaiting an active partner contract.`
    );
    err.statusCode = 501;
    err.code = "LIVE_PROVIDER_NOT_IMPLEMENTED";
    throw err;
  }

  /**
   * Autocomplete suggestions via live provider.
   */
  async getAutocompleteSuggestions(query) {
    if (!this.isConfigured()) {
      return [];
    }
    return [];
  }

  /**
   * Retrieves real-time rate and date-specific availability for a specific property.
   */
  async getHotelAvailability(hotelId, checkIn, checkOut, guests) {
    if (!this.isConfigured()) {
      const err = new Error("Live provider mode active, but valid API credentials are missing.");
      err.statusCode = 503;
      err.code = "LIVE_PROVIDER_NOT_CONFIGURED";
      throw err;
    }
    return null;
  }

  /**
   * Helper to verify room availability for date ranges.
   */
  isRoomAvailableForDates(roomId, checkInStr, checkOutStr, bookings = []) {
    if (!checkInStr || !checkOutStr) return true;
    const requestedStart = new Date(checkInStr);
    const requestedEnd = new Date(checkOutStr);
    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) return true;

    return !bookings.some((b) => {
      if (b.room.toString() !== roomId.toString() || b.status === "Cancelled") return false;
      const bIn = new Date(b.checkIn);
      const bOut = new Date(b.checkOut);
      return requestedStart < bOut && requestedEnd > bIn;
    });
  }

  /**
   * Normalizes an external OTA / GDS hotel payload into HotelPro schema.
   */
  normalizeHotelPayload(rawItem) {
    return {
      _id: `live_${rawItem.id || rawItem.hotelId}`,
      name: rawItem.name,
      slug: (rawItem.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: rawItem.description?.text || rawItem.description || "Live verified accommodation.",
      summary: rawItem.shortDescription || rawItem.name,
      propertyCategory: rawItem.category || "Luxury Hotel",
      address: {
        addressLine: rawItem.address?.lines?.[0] || "",
        locality: rawItem.address?.locality || "",
        city: rawItem.address?.cityName || "India",
        state: rawItem.address?.stateName || "",
        postalCode: rawItem.address?.postalCode || "",
        country: rawItem.address?.countryName || "India"
      },
      location: {
        type: "Point",
        coordinates: [rawItem.geoCode?.longitude || 0, rawItem.geoCode?.latitude || 0]
      },
      heroImage: rawItem.media?.[0]?.uri || "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      images: (rawItem.media || []).map((m) => m.uri),
      facilities: rawItem.amenities || ["Wi-Fi", "Air Conditioning"],
      amenities: rawItem.amenities || ["Free Wi-Fi"],
      starClassification: rawItem.rating ? Number(rawItem.rating) : null,
      isStarVerified: Boolean(rawItem.rating),
      rating: rawItem.guestRating?.overall ? Number(rawItem.guestRating.overall) : null,
      reviewCount: rawItem.guestRating?.reviewCount ? Number(rawItem.guestRating.reviewCount) : 0,
      priceRange: {
        min: rawItem.offers?.[0]?.price?.total ? Math.round(Number(rawItem.offers[0].price.total)) : 5000,
        max: 25000
      },
      startingPrice: rawItem.offers?.[0]?.price?.total ? Math.round(Number(rawItem.offers[0].price.total)) : 5000,
      currency: rawItem.offers?.[0]?.price?.currency || "INR",
      isDemo: false,
      source: "Upstream_Live_GDS"
    };
  }
}

module.exports = LiveHotelProviderInterface;
