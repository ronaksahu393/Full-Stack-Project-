const { normalizeDestination, CITY_ALIASES, STATE_MAPPINGS } = require("../../utils/destinationNormalizer");
const { calculateRecommendedScore } = require("../../utils/rankingEngine");
const { calculateIndianHotelTax } = require("../../utils/taxCalculator");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class DemoHotelProvider {
  constructor() {
    this.name = "HotelPro_Demo_Provider";
  }

  isConfigured() {
    return true;
  }

  isLiveIntegrated() {
    return false;
  }

  /**
   * Helper to fetch data sources from inMemoryStore or Mongoose
   */
  async getStores(app) {
    if (app && app.locals && app.locals.inMemoryStore) {
      return {
        hotels: app.locals.inMemoryStore.hotels || [],
        rooms: app.locals.inMemoryStore.rooms || [],
        bookings: app.locals.inMemoryStore.bookings || []
      };
    }

    try {
      const Hotel = require("../../models/Hotel");
      const Room = require("../../models/Room");
      const Booking = require("../../models/Booking");
      const [hotels, rooms, bookings] = await Promise.all([
        Hotel.find({ status: "published" }).lean(),
        Room.find({ isActive: true }).lean(),
        Booking.find({}).lean()
      ]);
      return { hotels, rooms, bookings };
    } catch {
      return { hotels: [], rooms: [], bookings: [] };
    }
  }

  /**
   * Checks if a room has available inventory for the requested dates.
   * Prevents overlapping active bookings from exceeding total room inventory.
   */
  isRoomAvailableForDates(roomOrId, checkInStr, checkOutStr, bookings = []) {
    if (!checkInStr || !checkOutStr) return true;

    const requestedStart = new Date(checkInStr);
    const requestedEnd = new Date(checkOutStr);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) return true;
    if (requestedEnd <= requestedStart) return false; // Invalid date sequence (checkout must be after checkin)

    // Check room maintenance or inactive status if room object passed
    if (typeof roomOrId === "object" && roomOrId !== null) {
      if (roomOrId.status === "Maintenance" || roomOrId.isActive === false) {
        return false;
      }
    }

    const roomIdStr = (
      typeof roomOrId === "object" && roomOrId !== null && roomOrId._id
        ? roomOrId._id
        : roomOrId
    ).toString();

    // Count overlapping active (non-cancelled) bookings for this room
    const overlappingCount = bookings.filter((b) => {
      const bRoomId = b.room ? (b.room._id ? b.room._id.toString() : b.room.toString()) : "";
      if (bRoomId !== roomIdStr) return false;
      if (b.status === "Cancelled") return false;

      const existingStart = new Date(b.checkIn);
      const existingEnd = new Date(b.checkOut);
      if (isNaN(existingStart.getTime()) || isNaN(existingEnd.getTime())) return false;

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      return requestedStart < existingEnd && requestedEnd > existingStart;
    }).length;

    const totalInventory =
      typeof roomOrId === "object" && roomOrId !== null
        ? Number(roomOrId.totalInventory) || Number(roomOrId.availableInventory) || 1
        : 1;

    return overlappingCount < totalInventory;
  }

  /**
   * Determines if a hotel matches the free-form destination or search query.
   * Strictly enforces whole-word location matching to prevent unrelated destinations from matching.
   */
  matchesDestinationQuery(hotel, rawQuery, normalizedQuery) {
    if (!rawQuery) return true;

    const q = rawQuery.trim().replace(/\s+/g, " ").toLowerCase();
    const norm = normalizedQuery.trim().replace(/\s+/g, " ").toLowerCase();

    const country = (hotel.address?.country || "India").toLowerCase();
    const city = (hotel.address?.city || "").toLowerCase();
    const state = (hotel.address?.state || "").toLowerCase();
    const locality = (hotel.address?.locality || "").toLowerCase();
    const postalCode = (hotel.address?.postalCode || "").toLowerCase();
    const name = (hotel.name || "").toLowerCase();

    // 1. Country-level Search ("India")
    if (q === "india" || norm === "india") {
      return country === "india";
    }

    // 2. Postal code match (minimum 5 digits)
    if (q.length >= 5 && postalCode && (postalCode === q || postalCode.startsWith(q))) {
      return true;
    }

    // 3. Exact or Normalized City Match
    if (city === q || city === norm) {
      return true;
    }
    // Check if the query contains the city as a whole word token (e.g. "hotels in jaipur", "resorts near udaipur")
    if (new RegExp(`\\b${escapeRegex(city)}\\b`, "i").test(q)) {
      return true;
    }

    // 4. Exact or Normalized State Match
    if (state === q || state === norm) {
      return true;
    }
    if (new RegExp(`\\b${escapeRegex(state)}\\b`, "i").test(q)) {
      return true;
    }

    // 5. Locality Match (e.g. "Candolim", "Assi Ghat", "C-Scheme", "Banjara Hills", "Fort Kochi")
    if (locality) {
      if (locality === q || locality === norm) return true;
      if (new RegExp(`\\b${escapeRegex(locality)}\\b`, "i").test(q)) return true;
      if (q.length >= 4 && locality.includes(q)) return true;
    }

    // 6. Hotel Name Match
    if (name === q || (q.length >= 3 && name.includes(q))) {
      return true;
    }

    // 7. Multi-word composite location match (e.g., "Vijay Nagar, Indore", "Candolim, Goa", "Fort Kochi, Kerala")
    const tokens = q
      .split(/[\s,]+/)
      .filter((t) => t.length > 1 && !["in", "and", "the", "near", "hotel", "hotels", "stay", "stays", "resort", "resorts"].includes(t));

    if (tokens.length >= 2) {
      const allTokensMatch = tokens.every(
        (t) =>
          city.includes(t) ||
          state.includes(t) ||
          locality.includes(t) ||
          name.includes(t)
      );
      if (allTokensMatch) return true;
    }

    return false;
  }

  /**
   * Comprehensive search and ranking across Indian hotel inventory
   */
  async searchHotels(searchParams, app) {
    const {
      destination,
      search,
      country: paramCountry,
      state: paramState,
      city: paramCity,
      locality: paramLocality,
      hotelName: paramHotelName,
      checkIn,
      checkOut,
      adults,
      children,
      rooms: requestedRoomCount,
      category,
      minPrice,
      maxPrice,
      starRating,
      minRating,
      amenities,
      freeWifi,
      swimmingPool,
      freeBreakfast,
      parking,
      ac,
      spa,
      restaurant,
      petFriendly,
      sort,
      page,
      limit
    } = searchParams;

    const { hotels, rooms, bookings } = await this.getStores(app);

    // 1. Destination normalization
    const rawQuery = (destination || search || "").trim();
    const normalizedQuery = normalizeDestination(rawQuery);
    const qLower = normalizedQuery.toLowerCase();

    let filteredHotels = [...hotels];

    // Explicit Structured Filters (Country, State, City, Locality, Hotel Name)
    if (paramCountry) {
      filteredHotels = filteredHotels.filter(
        (h) => (h.address?.country || "").toLowerCase() === paramCountry.toLowerCase().trim()
      );
    }

    if (paramState) {
      const normState = normalizeDestination(paramState).toLowerCase();
      filteredHotels = filteredHotels.filter((h) => {
        const hState = (h.address?.state || "").toLowerCase();
        return hState === normState || hState.includes(paramState.toLowerCase().trim());
      });
    }

    if (paramCity) {
      const normCity = normalizeDestination(paramCity).toLowerCase();
      filteredHotels = filteredHotels.filter((h) => {
        const hCity = (h.address?.city || "").toLowerCase();
        return hCity === normCity || hCity.includes(paramCity.toLowerCase().trim());
      });
    }

    if (paramLocality) {
      const targetLoc = paramLocality.toLowerCase().trim();
      filteredHotels = filteredHotels.filter(
        (h) => (h.address?.locality || "").toLowerCase().includes(targetLoc)
      );
    }

    if (paramHotelName) {
      const targetName = paramHotelName.toLowerCase().trim();
      filteredHotels = filteredHotels.filter(
        (h) => (h.name || "").toLowerCase().includes(targetName)
      );
    }

    // Free-form Destination Query (Strict Whole-Word & Component Matching)
    if (rawQuery) {
      filteredHotels = filteredHotels.filter((h) =>
        this.matchesDestinationQuery(h, rawQuery, normalizedQuery)
      );
    }

    // Filter by Property Category
    if (category && category !== "All") {
      filteredHotels = filteredHotels.filter(
        (h) => (h.propertyCategory || "").toLowerCase() === category.toLowerCase().trim()
      );
    }

    // Filter by Verified Star Rating (Official Classification)
    if (starRating && !isNaN(Number(starRating))) {
      const targetStar = Number(starRating);
      filteredHotels = filteredHotels.filter(
        (h) => h.starClassification !== null && h.starClassification !== undefined && h.starClassification >= targetStar
      );
    }

    // Filter by Minimum Guest Rating (only genuine rated properties; unrated hotels safely excluded from threshold)
    if (minRating && !isNaN(Number(minRating))) {
      filteredHotels = filteredHotels.filter(
        (h) => h.rating !== null && h.rating !== undefined && h.rating >= Number(minRating)
      );
    }

    // Filter by Amenities (Checks both facilities and amenities arrays)
    const amenityFilters = [];
    if (freeWifi === "true" || (amenities && amenities.includes("wifi"))) amenityFilters.push("wifi");
    if (swimmingPool === "true" || (amenities && amenities.includes("pool"))) amenityFilters.push("pool");
    if (freeBreakfast === "true" || (amenities && amenities.includes("breakfast"))) amenityFilters.push("breakfast");
    if (parking === "true" || (amenities && amenities.includes("parking"))) amenityFilters.push("parking");
    if (ac === "true" || (amenities && amenities.includes("ac"))) amenityFilters.push("ac");
    if (spa === "true" || (amenities && amenities.includes("spa"))) amenityFilters.push("spa");
    if (restaurant === "true" || (amenities && amenities.includes("restaurant"))) amenityFilters.push("restaurant");

    if (amenityFilters.length > 0) {
      filteredHotels = filteredHotels.filter((h) => {
        const combined = [...(h.facilities || []), ...(h.amenities || [])].map((item) =>
          item.toLowerCase()
        );
        return amenityFilters.every((req) => {
          if (req === "wifi") return combined.some((f) => f.includes("wi-fi") || f.includes("wifi"));
          if (req === "pool") return combined.some((f) => f.includes("pool"));
          if (req === "breakfast") return combined.some((f) => f.includes("breakfast"));
          if (req === "parking") return combined.some((f) => f.includes("parking") || f.includes("valet"));
          if (req === "ac") return combined.some((f) => f.includes("air conditioning") || f.includes(" ac") || f === "ac");
          if (req === "spa") return combined.some((f) => f.includes("spa") || f.includes("wellness"));
          if (req === "restaurant") return combined.some((f) => f.includes("restaurant") || f.includes("dining") || f.includes("bar"));
          return false;
        });
      });
    }

    if (petFriendly === "true") {
      filteredHotels = filteredHotels.filter((h) => h.policies?.petFriendly === true);
    }

    // 2. Date-based Room Availability, Capacity & Price Calculation
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;
    const hasValidDates =
      checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime());
    const isInvalidDateRange = hasValidDates && checkOutDate <= checkInDate;

    // If an invalid date range was specified (checkOut <= checkIn), return predictable empty results
    if (isInvalidDateRange) {
      return {
        count: 0,
        totalCount: 0,
        page: 1,
        totalPages: 1,
        limit: Number(limit) || 24,
        searchedDestination: rawQuery,
        normalizedDestination: normalizedQuery,
        mode: "demo",
        provider: this.name,
        isDemo: true,
        invalidDateRange: true,
        inventoryScope: "curated_demonstration",
        inventoryDisclaimer: "Curated demonstration catalog across selected Indian travel destinations. Does not represent exhaustive nationwide inventory.",
        hotels: []
      };
    }

    const totalGuests = (Number(adults) || 1) + (Number(children) || 0);
    const numRoomsRequested = Math.max(1, Number(requestedRoomCount) || 1);
    const guestsPerRoom = Math.ceil(totalGuests / numRoomsRequested);

    const hotelsWithAvailability = [];

    for (const hotel of filteredHotels) {
      // Find rooms for this hotel
      const hotelRooms = rooms.filter(
        (r) => r.hotel && r.hotel.toString() === hotel._id.toString()
      );

      // Check date availability and capacity per room
      const availableRooms = hotelRooms.filter((room) => {
        // Exclude maintenance or inactive rooms
        if (room.status === "Maintenance" || room.isActive === false) {
          return false;
        }

        // Capacity check per room
        if (room.capacity?.guests && room.capacity.guests < guestsPerRoom) {
          return false;
        }

        // Date-overlap availability check
        if (hasValidDates) {
          const isAvail = this.isRoomAvailableForDates(room, checkIn, checkOut, bookings);
          if (!isAvail) return false;
        }

        return true;
      });

      // If dates were specified and hotel has rooms defined, ensure at least requested room count is available
      if (hasValidDates && hotelRooms.length > 0 && availableRooms.length < numRoomsRequested) {
        continue;
      }

      // Calculate lowest available room price for requested dates
      const activeRooms = availableRooms.length > 0 ? availableRooms : hotelRooms;
      let effectiveStartingPrice = hotel.startingPrice;
      if (activeRooms.length > 0) {
        effectiveStartingPrice = Math.min(...activeRooms.map((r) => r.pricePerNight));
      }

      // Filter by min/max price against effective starting price
      if (minPrice && !isNaN(Number(minPrice)) && effectiveStartingPrice < Number(minPrice)) {
        continue;
      }
      if (maxPrice && !isNaN(Number(maxPrice)) && effectiveStartingPrice > Number(maxPrice)) {
        continue;
      }

      // Compute Ranking Score (Rating score is conservative for unrated stays)
      const ranking = calculateRecommendedScore(hotel, {
        destination: rawQuery || normalizedQuery,
        maxPrice
      });

      // Check for exact locality match to prioritize in sorting
      const isLocalityMatch =
        (paramLocality && hotel.address?.locality?.toLowerCase().includes(paramLocality.toLowerCase())) ||
        (qLower && hotel.address?.locality && qLower.includes(hotel.address.locality.toLowerCase()));

      hotelsWithAvailability.push({
        ...hotel,
        isLocalityMatch: Boolean(isLocalityMatch),
        availableRoomCount: activeRooms.length,
        availableRooms: activeRooms.slice(0, 3), // Preview up to 3 room types
        effectiveStartingPrice,
        taxDetails: calculateIndianHotelTax(effectiveStartingPrice, 1),
        rankingScore: ranking.score + (isLocalityMatch ? 15 : 0),
        rankingBreakdown: ranking.breakdown
      });
    }

    // 3. Sorting Options
    if (sort === "price-asc") {
      hotelsWithAvailability.sort((a, b) => a.effectiveStartingPrice - b.effectiveStartingPrice);
    } else if (sort === "price-desc") {
      hotelsWithAvailability.sort((a, b) => b.effectiveStartingPrice - a.effectiveStartingPrice);
    } else if (sort === "rating") {
      hotelsWithAvailability.sort((a, b) => {
        const ratingA = a.rating !== null && a.rating !== undefined ? Number(a.rating) : -1;
        const ratingB = b.rating !== null && b.rating !== undefined ? Number(b.rating) : -1;
        if (ratingB === ratingA) return (b.reviewCount || 0) - (a.reviewCount || 0);
        return ratingB - ratingA;
      });
    } else if (sort === "review-count") {
      hotelsWithAvailability.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      // Default: Recommended (composite multi-factor scoring with locality prioritization)
      hotelsWithAvailability.sort((a, b) => {
        if (b.isLocalityMatch !== a.isLocalityMatch) {
          return b.isLocalityMatch ? 1 : -1;
        }
        return b.rankingScore - a.rankingScore;
      });
    }

    // 4. Pagination
    const totalCount = hotelsWithAvailability.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Number(limit) && Number(limit) > 0 ? Number(limit) : 24;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedHotels = hotelsWithAvailability.slice(startIndex, startIndex + limitNum);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return {
      count: paginatedHotels.length,
      totalCount,
      page: pageNum,
      totalPages,
      limit: limitNum,
      searchedDestination: rawQuery,
      normalizedDestination: normalizedQuery,
      mode: "demo",
      provider: this.name,
      isDemo: true,
      inventoryScope: "curated_demonstration",
      inventoryDisclaimer: "Curated demonstration catalog across selected Indian travel destinations. Does not represent exhaustive nationwide inventory.",
      hotels: paginatedHotels
    };
  }

  /**
   * Autocomplete endpoint: suggestions for country, states, cities, localities, and hotel names
   */
  async getAutocompleteSuggestions(query, app) {
    if (!query || typeof query !== "string") return [];
    const qLower = query.trim().toLowerCase();
    const { hotels } = await this.getStores(app);

    const suggestions = [];
    const seen = new Set();

    // 1. Match Country (Explicit curated catalog scope)
    if ("india".startsWith(qLower) || qLower.startsWith("india")) {
      seen.add("country_india");
      suggestions.push({
        type: "country",
        label: "India (Curated Boutique Catalog)",
        country: "India",
        propertyCount: hotels.filter((h) => (h.address?.country || "India").toLowerCase() === "india").length
      });
    }

    // 2. Match Localities
    for (const h of hotels) {
      const locality = h.address?.locality;
      const city = h.address?.city;
      const state = h.address?.state;
      if (
        locality &&
        (locality.toLowerCase().includes(qLower) || qLower.includes(locality.toLowerCase())) &&
        !seen.has(`locality_${locality}_${city}`)
      ) {
        seen.add(`locality_${locality}_${city}`);
        const count = hotels.filter(
          (item) => item.address?.locality === locality && item.address?.city === city
        ).length;
        suggestions.push({
          type: "locality",
          label: `${locality}, ${city}`,
          locality,
          city,
          state,
          propertyCount: count
        });
      }
    }

    // 3. Match Cities
    for (const h of hotels) {
      const city = h.address?.city;
      const state = h.address?.state;
      if (city && city.toLowerCase().startsWith(qLower) && !seen.has(`city_${city}`)) {
        seen.add(`city_${city}`);
        const count = hotels.filter((item) => item.address?.city === city).length;
        suggestions.push({
          type: "city",
          label: `${city}, ${state}`,
          city,
          state,
          propertyCount: count
        });
      }
    }

    // 4. Match States
    for (const h of hotels) {
      const state = h.address?.state;
      if (state && state.toLowerCase().startsWith(qLower) && !seen.has(`state_${state}`)) {
        seen.add(`state_${state}`);
        const count = hotels.filter((item) => item.address?.state === state).length;
        suggestions.push({
          type: "state",
          label: `${state}, India`,
          state,
          propertyCount: count
        });
      }
    }

    // 5. Match Hotel Names
    for (const h of hotels) {
      const name = h.name;
      if (name && name.toLowerCase().includes(qLower) && !seen.has(`hotel_${h._id}`)) {
        seen.add(`hotel_${h._id}`);
        suggestions.push({
          type: "hotel",
          label: name,
          city: h.address?.city,
          state: h.address?.state,
          hotelId: h._id,
          slug: h.slug,
          startingPrice: h.startingPrice,
          starClassification: h.starClassification
        });
      }
    }

    return suggestions.slice(0, 8);
  }
}

module.exports = DemoHotelProvider;
