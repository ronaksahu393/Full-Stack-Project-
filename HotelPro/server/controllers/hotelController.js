const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { getHotelProvider, getProviderStatus } = require("../services/providers");
const { calculateIndianHotelTax } = require("../utils/taxCalculator");

// @desc    Get hotel inventory provider status and active mode (demo vs live)
// @route   GET /api/hotels/provider-status
exports.getProviderStatus = async (req, res) => {
  res.json(getProviderStatus());
};

// @desc    Search Indian hotels with availability, filters & ranking
// @route   GET /api/hotels/search
exports.searchHotels = async (req, res, next) => {
  try {
    const provider = getHotelProvider();
    const result = await provider.searchHotels(req.query, req.app);
    res.json(result);
  } catch (err) {
    if (err.code === "LIVE_PROVIDER_NOT_CONFIGURED" || err.code === "LIVE_PROVIDER_NOT_IMPLEMENTED") {
      return res.status(err.statusCode || 503).json({
        error: "LiveProviderUnavailable",
        code: err.code,
        message: err.message,
        mode: "live",
        count: 0,
        hotels: []
      });
    }
    next(err);
  }
};

// @desc    Destination autocomplete (cities, states, hotels)
// @route   GET /api/hotels/autocomplete
exports.getAutocomplete = async (req, res, next) => {
  try {
    const provider = getHotelProvider();
    const query = req.query.q || req.query.query || "";
    const suggestions = await provider.getAutocompleteSuggestions(query, req.app);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
};

// @desc    Get hotel details by ID or slug with room types
// @route   GET /api/hotels/:id
exports.getHotelById = async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;
    const provider = getHotelProvider();

    // In live mode, verify provider configuration rather than silently reading demo data
    if (provider.name === "Live_Hotel_Provider_Adapter") {
      if (!provider.isConfigured()) {
        return res.status(503).json({
          error: "LiveProviderUnavailable",
          code: "LIVE_PROVIDER_NOT_CONFIGURED",
          message: "Live hotel inventory provider is active, but required external API credentials are not configured.",
          mode: "live"
        });
      }
      return res.status(501).json({
        error: "LiveProviderUnavailable",
        code: "LIVE_PROVIDER_NOT_IMPLEMENTED",
        message: "Live hotel property lookup requires an active external provider endpoint contract.",
        mode: "live"
      });
    }

    const store = req.app.locals.inMemoryStore;
    const { checkIn, checkOut } = req.query;

    let hotel = null;
    let hotelRooms = [];

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug) && /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    if (store) {
      hotel = store.hotels?.find(
        (h) => h._id.toString() === idOrSlug.toString() || h.slug === idOrSlug
      );
      if (hotel) {
        hotelRooms = (store.rooms || []).filter(
          (r) => (r.hotel && r.hotel.toString() === hotel._id.toString()) || (r.hotelSlug && r.hotelSlug === hotel.slug)
        );
      }
    } else {
      hotel = await Hotel.findOne(
        isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug }
      );
      if (hotel) {
        hotelRooms = await Room.find({
          $or: [{ hotel: hotel._id }, { hotelSlug: hotel.slug }],
          isActive: { $ne: false }
        }).lean();

        if (hotelRooms.length === 0) {
          const basePrice = Number(hotel.startingPrice || hotel.effectiveStartingPrice) || 5500;
          const city = hotel.address?.city || "India";
          const state = hotel.address?.state || "";
          const loc = `${city}${state ? ", " + state : ""}, India`;
          const img = hotel.heroImage || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80";
          const img2 = (hotel.images && hotel.images[1]) || (hotel.images && hotel.images[0]) || img;

          try {
            const created = await Room.create([
              {
                hotel: hotel._id,
                hotelSlug: hotel.slug,
                name: `${hotel.name} - Deluxe Heritage Suite`,
                category: "Deluxe Suite",
                property: hotel.name,
                location: loc,
                pricePerNight: basePrice,
                capacity: { guests: 2, adults: 2, children: 1, bedrooms: 1, beds: 1, bedType: "King Bed", bathrooms: 1 },
                sizeSqM: 48,
                totalInventory: 5,
                availableInventory: 5,
                status: "Available",
                summary: `Spacious handcrafted luxury suite at ${hotel.name} featuring traditional artwork, garden views, and premium bath.`,
                description: `Immerse yourself in authentic Indian luxury at ${hotel.name} with handcrafted furnishings, fine cotton linens, and 24/7 concierge assistance.`,
                heroImage: img,
                gallery: hotel.images && hotel.images.length > 0 ? hotel.images : [img],
                amenities: ["High-speed Wi-Fi", "Breakfast Included", "Air Conditioning", "Ensuite Marble Bath", "24/7 Room Service"],
                isActive: true
              },
              {
                hotel: hotel._id,
                hotelSlug: hotel.slug,
                name: `${hotel.name} - Royal Palace Suite`,
                category: "Executive Suite",
                property: hotel.name,
                location: loc,
                pricePerNight: Math.round(basePrice * 1.45),
                capacity: { guests: 3, adults: 2, children: 1, bedrooms: 1, beds: 2, bedType: "Royal King Bed", bathrooms: 2 },
                sizeSqM: 72,
                totalInventory: 3,
                availableInventory: 3,
                status: "Available",
                summary: `Panoramic view suite at ${hotel.name} with private balcony, soaking tub, and dedicated butler service.`,
                description: `The pinnacle of regal living at ${hotel.name}. Features an expansive living parlor, heritage architectural arches, and private terrace.`,
                heroImage: img2,
                gallery: hotel.images && hotel.images.length > 0 ? hotel.images : [img2],
                amenities: ["Panoramic Balcony", "Butler Service", "Complimentary Airport Transfer", "Jacuzzi", "Breakfast & High Tea"],
                isActive: true
              }
            ]);
            hotelRooms = created.map((r) => r.toObject());
          } catch (createErr) {
            console.error("Room auto-creation fallback error:", createErr.message);
          }
        }
      }
    }

    if (!hotel) {
      return res.status(404).json({ message: "Hotel property not found in directory." });
    }

    // Annotate room tax breakdown and availability
    const bookings = store ? store.bookings : await Booking.find({});

    const enrichedRooms = hotelRooms.map((room) => {
      const rawRoom = room.toObject ? room.toObject() : room;
      const isAvailable = provider.isRoomAvailableForDates
        ? provider.isRoomAvailableForDates(rawRoom._id, checkIn, checkOut, bookings)
        : true;

      const tax = calculateIndianHotelTax(rawRoom.pricePerNight, 1);
      return {
        ...rawRoom,
        isAvailable,
        taxDetails: tax
      };
    });

    res.json({
      hotel,
      rooms: enrichedRooms,
      roomCount: enrichedRooms.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured Indian heritage & luxury boutique hotels
// @route   GET /api/hotels/featured
exports.getFeaturedHotels = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    let featured = [];

    if (store) {
      featured = (store.hotels || []).filter((h) => h.featured);
      if (featured.length === 0) featured = (store.hotels || []).slice(0, 4);
    } else {
      featured = await Hotel.find({ featured: true, status: "published" }).limit(6);
    }

    res.json({ count: featured.length, hotels: featured });
  } catch (err) {
    next(err);
  }
};

// @desc    Get destinations directory (cities and states with property counts)
// @route   GET /api/hotels/destinations
exports.getDestinations = async (req, res, next) => {
  try {
    const store = req.app.locals.inMemoryStore;
    const hotels = store ? store.hotels || [] : await Hotel.find({});

    const destinationMap = {};
    for (const h of hotels) {
      const city = h.address?.city;
      const state = h.address?.state;
      if (!city) continue;

      if (!destinationMap[city]) {
        destinationMap[city] = {
          city,
          state,
          count: 0,
          image: h.heroImage,
          startingPrice: h.startingPrice
        };
      }
      destinationMap[city].count += 1;
      if (h.startingPrice < destinationMap[city].startingPrice) {
        destinationMap[city].startingPrice = h.startingPrice;
      }
    }

    const destinations = Object.values(destinationMap).sort((a, b) => b.count - a.count);
    res.json({ count: destinations.length, destinations });
  } catch (err) {
    next(err);
  }
};
